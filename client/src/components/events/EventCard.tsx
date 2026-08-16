import { Link } from "react-router-dom";
import type { Event } from "../../types";
import { formatCurrency, formatDate } from "../../utils/format";
import { CalendarIcon, MapPinIcon, TicketIcon } from "../ui/icons";
import { StatusBadge } from "./StatusBadge";

export function EventCard({ event }: { event: Event }) {
  const cancelled = event.status === "CANCELLED";

  return (
    <Link
      to={`/events/${event.id}`}
      className="card card--hover event-card"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="event-card-banner">
        <span className="event-card-banner-icon">
          <TicketIcon size={56} />
        </span>
        <span className="event-card-status">
          <StatusBadge status={event.status} />
        </span>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <span className="event-card-meta-row">
            <CalendarIcon size={16} /> {formatDate(event.startDate)}
          </span>
          <span className="event-card-meta-row">
            <MapPinIcon size={16} /> {event.location}
          </span>
        </div>
      </div>
      <div className="event-card-footer">
        <div>
          <div className="field-hint">From</div>
          <span className="event-card-price">
            {formatCurrency(event.ticketPrice, event.currency)}
          </span>
        </div>
        {cancelled ? null : (
          <span className="btn btn--primary btn--sm">View event</span>
        )}
      </div>
    </Link>
  );
}
