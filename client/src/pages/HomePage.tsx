import { Link } from "react-router-dom";
import { EventCard } from "../components/events/EventCard";
import { Alert } from "../components/ui/Alert";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { TicketIcon } from "../components/ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { getEvents } from "../services/event.service";

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { data, loading, error } = useApi(() => getEvents());

  const events = (data ?? [])
    .filter((event) => event.status !== "CANCELLED")
    .slice(0, 6);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">Eventful &middot; Discover &amp; Attend</span>
          <h1>Your passport to a world of unforgettable moments.</h1>
          <p>
            From pulsating concerts to captivating theater, thrilling sports
            and enlightening cultural gatherings - discover experiences that
            cater to every taste and passion.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn--primary btn--lg">
              Explore events
            </Link>
            {!isAuthenticated ? (
              <Link to="/register" className="btn btn--outline btn--lg">
                Create account
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Upcoming events"}
            </h2>
            <p className="page-subtitle">Hand-picked experiences near you.</p>
          </div>
          <Link to="/events" className="btn btn--outline">
            View all events
          </Link>
        </div>

        {loading ? (
          <div className="grid grid--events">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}

        {!loading && !error && events.length === 0 ? (
          <EmptyState
            icon={<TicketIcon size={48} />}
            title="No events yet"
            text="Events created on Eventful will appear here once creators publish them."
          />
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <div className="grid grid--events">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
