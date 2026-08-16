import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/events/StatusBadge";
import { TicketCard } from "../components/tickets/TicketCard";
import { Alert } from "../components/ui/Alert";
import { EmptyState } from "../components/ui/EmptyState";
import { TicketIcon } from "../components/ui/icons";
import { useApi } from "../hooks/useApi";
import { getEvent } from "../services/event.service";
import { getMyTickets } from "../services/ticket.service";
import type { Event, Ticket } from "../types";
import { formatDate, formatCurrency } from "../utils/format";

interface TicketWithEvent {
  ticket: Ticket;
  event: Event | null;
}

export function MyTicketsPage() {
  const { data: tickets, loading, error } = useApi(() => getMyTickets());

  const [rows, setRows] = useState<TicketWithEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setRows([]);
      return;
    }

    let active = true;
    setLoadingEvents(true);
    setEventsError(null);

    const eventIds = Array.from(new Set(tickets.map((ticket) => ticket.eventId)));

    Promise.all(
      eventIds.map(async (eventId) => {
        try {
          return { eventId, event: await getEvent(eventId) };
        } catch {
          return { eventId, event: null };
        }
      }),
    )
      .then((resolved) => {
        if (!active) return;
        const byId = new Map(resolved.map((item) => [item.eventId, item.event]));
        setRows(
          tickets.map((ticket) => ({
            ticket,
            event: byId.get(ticket.eventId) ?? null,
          })),
        );
      })
      .catch(() => {
        if (!active) return;
        setEventsError("Some event details could not be loaded.");
      })
      .finally(() => {
        if (active) setLoadingEvents(false);
      });

    return () => {
      active = false;
    };
  }, [tickets]);

  if (loading) {
    return (
      <div className="container page">
        <div className="page-header">
          <h1 className="page-title">My tickets</h1>
        </div>
        <Alert variant="info">Loading your tickets...</Alert>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My tickets</h1>
          <p className="page-subtitle">
            All the tickets you have purchased, with QR codes for entry.
          </p>
        </div>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!error && (tickets ?? []).length === 0 ? (
        <EmptyState
          icon={<TicketIcon size={48} />}
          title="No tickets yet"
          text="When you buy tickets to an event, they will show up here."
          action={
            <Link to="/events" className="btn btn--primary">
              Browse events
            </Link>
          }
        />
      ) : null}

      {!error && (tickets ?? []).length > 0 ? (
        <div className="ticket-list">
          {loadingEvents ? (
            <Alert variant="info">Loading event details...</Alert>
          ) : null}
          {eventsError ? <Alert variant="error">{eventsError}</Alert> : null}
          {rows.map(({ ticket, event }) => (
            <div className="ticket-group" key={ticket.id}>
              {event ? (
                <div className="ticket-event-head">
                  <div>
                    <Link to={`/events/${event.id}`}>
                      <h3 style={{ margin: 0 }}>{event.title}</h3>
                    </Link>
                    <p className="field-hint" style={{ margin: "0.25rem 0 0" }}>
                      {formatDate(event.startDate)} &middot; {event.location}{" "}
                      &middot; {formatCurrency(event.ticketPrice, event.currency)}{" "}
                      per ticket
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ) : (
                <p className="field-hint">Event details unavailable</p>
              )}
              <TicketCard ticket={ticket} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
