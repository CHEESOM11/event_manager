import { Link } from "react-router-dom";
import { StatusBadge } from "../components/events/StatusBadge";
import { Alert } from "../components/ui/Alert";
import { Card, CardBody } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import {
  ChartIcon,
  PencilIcon,
  PlusIcon,
  TicketIcon,
} from "../components/ui/icons";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useApi } from "../hooks/useApi";
import { getMyEvents } from "../services/event.service";
import { formatCurrency, formatDate } from "../utils/format";

export function MyEventsPage() {
  const { data, loading, error } = useApi(() => getMyEvents());

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My events</h1>
          <p className="page-subtitle">
            Events you have created and their current status.
          </p>
        </div>
        <Link to="/events/new" className="btn btn--primary">
          <PlusIcon size={18} /> Create event
        </Link>
      </div>

      {loading ? (
        <div className="grid grid--events">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : null}

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!loading && !error && (data ?? []).length === 0 ? (
        <EmptyState
          icon={<TicketIcon size={48} />}
          title="No events yet"
          text="Create your first event to start selling tickets."
          action={
            <Link to="/events/new" className="btn btn--primary">
              Create event
            </Link>
          }
        />
      ) : null}

      {!loading && !error && (data ?? []).length > 0 ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          {(data ?? []).map((event) => (
            <Card key={event.id}>
              <CardBody>
                <div className="event-card-head">
                  <div className="event-card-meta" style={{ marginBottom: 0 }}>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    <span className="event-card-meta-row">
                      {formatDate(event.startDate)} &middot; {event.location}
                    </span>
                    <span className="event-card-meta-row">
                      {formatCurrency(event.ticketPrice, event.currency)} per
                      ticket &middot; {event.totalTickets} tickets
                    </span>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.625rem",
                    marginTop: 12,
                  }}
                >
                  <Link
                    to={`/events/${event.id}`}
                    className="btn btn--outline btn--sm"
                  >
                    View
                  </Link>
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="btn btn--outline btn--sm"
                  >
                    <PencilIcon size={16} /> Edit
                  </Link>
                  <Link
                    to={`/events/${event.id}/analytics`}
                    className="btn btn--outline btn--sm"
                  >
                    <ChartIcon size={16} /> Analytics
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
