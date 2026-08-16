import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShareMenu } from "../components/events/ShareMenu";
import { StatusBadge } from "../components/events/StatusBadge";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { FullPageSpinner } from "../components/ui/Spinner";
import {
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
} from "../components/ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { cancelEvent, getEvent } from "../services/event.service";
import { formatCurrency, formatDate } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: event, loading, error } = useApi(
    () => getEvent(id ?? ""),
    [id],
  );

  const [quantity, setQuantity] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="container page">
        <Alert variant="error">{error}</Alert>
        <Link to="/events">Back to events</Link>
      </div>
    );
  }

  if (!event) return null;

  const isOwner = user?.id === event.creatorId;
  const cancelled = event.status === "CANCELLED";

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: `/events/${event.id}` },
      });
      return;
    }
    setBuyOpen(true);
  };

  const handleConfirmPurchase = () => {
    setBuyOpen(false);
    navigate(`/checkout?event=${event.id}&quantity=${quantity}`);
  };

  const handleCancelEvent = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelEvent(event.id);
      navigate("/my-events");
    } catch (err) {
      setCancelError(getErrorMessage(err));
      setCancelling(false);
    }
  };

  return (
    <div className="container page">
      <Link to="/events" style={{ display: "inline-block", marginBottom: 16 }}>
        &larr; Back to events
      </Link>

      <div className="detail-banner">
        <div className="detail-banner-eyebrow">
          Event details
          <StatusBadge status={event.status} />
        </div>
        <h1>{event.title}</h1>
        <p>
          {formatDate(event.startDate)} &rarr; {formatDate(event.endDate)}
        </p>
      </div>

      <div className="detail-grid">
        <div>
          <Card>
            <CardBody>
              <h2 className="section-title">About this event</h2>
              <p>{event.description}</p>

              <div
                className="event-card-meta"
                style={{ marginTop: 16, fontSize: "0.9375rem" }}
              >
                <span className="event-card-meta-row">
                  <CalendarIcon size={18} /> {formatDate(event.startDate)}
                </span>
                <span className="event-card-meta-row">
                  <ClockIcon size={18} /> Ends {formatDate(event.endDate)}
                </span>
                <span className="event-card-meta-row">
                  <MapPinIcon size={18} /> {event.location}
                </span>
                <span className="event-card-meta-row">
                  <UsersIcon size={18} /> {event.totalTickets} tickets in total
                </span>
                <span className="event-card-meta-row">
                  <TagIcon size={18} />{" "}
                  {formatCurrency(event.ticketPrice, event.currency)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="buy-box">
          <Card>
            <CardBody>
              <h3 style={{ marginBottom: 8 }}>
                {formatCurrency(event.ticketPrice, event.currency)}
              </h3>
              <p className="field-hint">Includes entry to {event.title}.</p>

              {cancelled ? (
                <Alert variant="warning">
                  This event has been cancelled and tickets can no longer be
                  purchased.
                </Alert>
              ) : (
                <Button block size="lg" onClick={handleBuyClick}>
                  <TicketIcon size={18} /> Get tickets
                </Button>
              )}

              {!isAuthenticated && !cancelled ? (
                <p className="field-hint" style={{ marginTop: 12 }}>
                  You need to be logged in as an eventee to buy tickets.{" "}
                  <Link to="/register">Sign up</Link> or{" "}
                  <Link to="/login">log in</Link>.
                </p>
              ) : null}

              {isAuthenticated && user?.role === "EVENT_CREATOR" && !isOwner ? (
                <Alert variant="info">
                  You are signed in as an event creator. Only eventees can buy
                  tickets.
                </Alert>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <ShareMenu eventId={event.id} eventTitle={event.title} />
              </div>
            </CardBody>
          </Card>

          {isOwner ? (
            <Card style={{ marginTop: "1rem" }}>
              <CardBody>
                <h3 className="section-title" style={{ marginBottom: 12 }}>
                  Manage event
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.625rem",
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                  >
                    <PencilIcon size={16} /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/events/${event.id}/analytics`)}
                  >
                    <ChartIcon size={16} /> Analytics
                  </Button>
                  {!cancelled ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel event
                    </Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={buyOpen}
        title="Buy tickets"
        onClose={() => setBuyOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setBuyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase}>
              Continue to payment
            </Button>
          </>
        }
      >
        <p>{event.title}</p>
        <div className="field">
          <label className="label" htmlFor="quantity">
            Quantity
          </label>
          <select
            id="quantity"
            className="select"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
              <option key={count} value={count}>
                {count} ticket{count > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <p>
          Total:{" "}
          <strong>
            {formatCurrency(event.ticketPrice * quantity, event.currency)}
          </strong>
        </p>
      </Modal>

      <Modal
        open={cancelOpen}
        title="Cancel event"
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep event
            </Button>
            <Button
              variant="danger"
              loading={cancelling}
              onClick={handleCancelEvent}
            >
              Yes, cancel event
            </Button>
          </>
        }
      >
        {cancelError ? <Alert variant="error">{cancelError}</Alert> : null}
        <p>
          Are you sure you want to cancel <strong>{event.title}</strong>? This
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
