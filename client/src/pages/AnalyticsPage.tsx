import { Link, useParams } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Card, CardBody } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ChartIcon } from "../components/ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { getEventAnalytics } from "../services/analytics.service";
import { getEvent } from "../services/event.service";
import { formatCurrency } from "../utils/format";

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="stat-tile">
          <span className="stat-tile-label">{label}</span>
          <span className="stat-tile-value">{value}</span>
          {hint ? <span className="stat-tile-hint">{hint}</span> : null}
        </div>
      </CardBody>
    </Card>
  );
}

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: event, loading: eventLoading, error: eventError } = useApi(
    () => getEvent(id ?? ""),
    [id],
  );

  const { data, loading, error } = useApi(
    () => getEventAnalytics(id ?? ""),
    [id],
  );

  if (eventLoading || loading) {
    return (
      <div className="container page">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
        </div>
        <Alert variant="info">Loading analytics...</Alert>
      </div>
    );
  }

  if (eventError || error) {
    return (
      <div className="container page">
        <Alert variant="error">{eventError ?? error}</Alert>
        <Link to="/my-events">Back to my events</Link>
      </div>
    );
  }

  if (!event || !data) return null;

  if (user?.id !== event.creatorId) {
    return (
      <div className="container page">
        <Alert variant="error">
          You do not have permission to view analytics for this event.{" "}
          <Link to="/my-events">Back to my events</Link>
        </Alert>
      </div>
    );
  }

  const sellThrough =
    data.totalTickets > 0
      ? Math.round((data.ticketsSold / data.totalTickets) * 100)
      : 0;

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{data.eventName}</h1>
          <p className="page-subtitle">Performance overview for this event.</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatTile
          label="Tickets sold"
          value={String(data.ticketsSold)}
          hint={`${sellThrough}% sold out`}
        />
        <StatTile
          label="Tickets remaining"
          value={String(data.ticketsRemaining)}
        />
        <StatTile
          label="Tickets used"
          value={String(data.ticketsUsed)}
          hint={`${data.ticketsValid} still valid`}
        />
        <StatTile
          label="Total revenue"
          value={formatCurrency(data.totalRevenue)}
        />
        <StatTile label="Tickets cancelled" value={String(data.ticketsCancelled)} />
      </div>

      {data.ticketsSold === 0 ? (
        <EmptyState
          icon={<ChartIcon size={48} />}
          title="No sales yet"
          text="Share your event to start selling tickets. Analytics update in real time."
        />
      ) : null}
    </div>
  );
}
