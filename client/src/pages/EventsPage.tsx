import { useMemo, useState } from "react";
import { EventCard } from "../components/events/EventCard";
import { Alert } from "../components/ui/Alert";
import { EmptyState } from "../components/ui/EmptyState";
import { SearchIcon, TicketIcon } from "../components/ui/icons";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useApi } from "../hooks/useApi";
import { getEvents } from "../services/event.service";

export function EventsPage() {
  const { data, loading, error } = useApi(() => getEvents());
  const [query, setQuery] = useState("");

  const events = useMemo(
    () => (data ?? []).filter((event) => event.status !== "CANCELLED"),
    [data],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term),
    );
  }, [events, query]);

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">
            Discover experiences curated for every taste and passion.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, marginBottom: "1.5rem" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                display: "inline-flex",
              }}
            >
              <SearchIcon size={18} />
            </span>
            <input
              className="input"
              style={{ paddingLeft: 40 }}
              placeholder="Search by title, location or description..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid--events">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : null}

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          icon={<TicketIcon size={48} />}
          title={query ? "No matching events" : "No events yet"}
          text={
            query
              ? "Try a different search term."
              : "Events created on Eventful will appear here once creators publish them."
          }
        />
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid--events">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
