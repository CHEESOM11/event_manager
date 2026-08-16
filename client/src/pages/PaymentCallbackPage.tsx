import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardBody } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { CheckIcon } from "../components/ui/icons";
import { FullPageSpinner } from "../components/ui/Spinner";
import { verifyPayment } from "../services/payment.service";
import type { PaymentVerification } from "../types";
import { getErrorMessage } from "../utils/errors";
import { clearPendingPayment, getPendingPayment } from "../utils/pendingPayment";

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const [verification, setVerification] = useState<PaymentVerification | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No payment reference was provided.");
      setLoading(false);
      return;
    }

    let active = true;

    verifyPayment(reference)
      .then((result) => {
        if (!active) return;
        setVerification(result);
        clearPendingPayment();
      })
      .catch((err) => {
        if (!active) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reference]);

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="container page">
        <EmptyState
          icon={<CheckIcon size={48} />}
          title="Payment could not be verified"
          text={error}
          action={
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <Link to="/my-tickets" className="btn btn--primary">
                View my tickets
              </Link>
              <Link to="/" className="btn btn--outline">
                Back to home
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const pending = getPendingPayment();
  const payment = verification?.payment;
  const ticketCount = verification?.tickets?.length ?? pending?.quantity ?? 0;

  return (
    <div className="container page">
      <Card className="form-card">
        <CardBody>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              className="success-icon"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--color-success-bg, #e6f4ea)",
                color: "var(--color-success, #1a7f37)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <CheckIcon size={32} />
            </div>
            <h1 className="page-title" style={{ marginBottom: 8 }}>
              Payment successful
            </h1>
            <p className="page-subtitle">
              {payment
                ? `Payment of ${payment.currency} ${Number(payment.amount).toFixed(
                    2,
                  )} completed. ${ticketCount} ticket${
                    ticketCount === 1 ? "" : "s"
                  } created.`
                : "Your payment has been processed."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            <Link
              to="/my-tickets"
              className="btn btn--primary btn--block"
              style={{ flex: 1 }}
            >
              View my tickets
            </Link>
            <Link
              to="/"
              className="btn btn--outline btn--block"
              style={{ flex: 1 }}
            >
              Back to home
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
