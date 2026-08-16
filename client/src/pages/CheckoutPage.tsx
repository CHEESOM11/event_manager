import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { FullPageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { initializePayment } from "../services/payment.service";
import { getEvent } from "../services/event.service";
import { createTicketOrder } from "../services/ticket.service";
import { formatCurrency, formatDate, pluralize } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { savePendingPayment } from "../utils/pendingPayment";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const eventId = searchParams.get("event") ?? "";
  const quantity = Math.max(1, Number(searchParams.get("quantity")) || 1);

  const {
    data: event,
    loading: eventLoading,
    error: eventError,
  } = useApi(() => getEvent(eventId), [eventId]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "EVENTEE") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (eventLoading) return <FullPageSpinner />;

  if (eventError || !event) {
    return (
      <div className="container page">
        <Alert variant="error">{eventError ?? "Event not found"}</Alert>
        <Link to="/events">Back to events</Link>
      </div>
    );
  }

  const totalAmount = event.ticketPrice * quantity;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    try {
      const order = await createTicketOrder(event.id, quantity);
      const initialization = await initializePayment({
        email: user?.email ?? "",
        amount: order.totalAmount,
        eventId: order.eventId,
        quantity: order.quantity,
      });
      savePendingPayment({
        reference: initialization.reference,
        eventId: order.eventId,
        quantity: order.quantity,
        eventTitle: event.title,
      });
      window.location.href = initialization.authorization_url;
    } catch (err) {
      setError(getErrorMessage(err));
      setProcessing(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Review your order and pay securely.</p>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <Card>
            <CardBody>
              <h2 className="section-title">Event</h2>
              <h3 style={{ margin: 0 }}>{event.title}</h3>
              <p className="field-hint" style={{ marginBottom: 0 }}>
                {formatDate(event.startDate)} &middot; {event.location}
              </p>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody>
              <h2 className="section-title">Order summary</h2>

              <div className="order-row">
                <span>
                  {pluralize(quantity, "ticket", "tickets")} &times;{" "}
                  {formatCurrency(event.ticketPrice, event.currency)}
                </span>
                <span>
                  {formatCurrency(event.ticketPrice * quantity, event.currency)}
                </span>
              </div>
              <div className="order-row order-row--total">
                <span>Total</span>
                <span>{formatCurrency(totalAmount, event.currency)}</span>
              </div>

              {error ? <Alert variant="error">{error}</Alert> : null}

              <Button
                block
                size="lg"
                loading={processing}
                disabled={event.status === "CANCELLED"}
                onClick={handlePay}
              >
                Proceed to payment
              </Button>

              <p className="field-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                You will be redirected to Paystack to complete your payment
                securely. Tickets are issued once payment is verified.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

