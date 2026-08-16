import { useState } from "react";
import { Link } from "react-router-dom";
import type { Ticket } from "../../types";
import { getTicketQr } from "../../services/qr.service";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { StatusBadge } from "../events/StatusBadge";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { QrCodeIcon } from "../ui/icons";
import { Modal } from "../ui/Modal";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadQr = async () => {
    if (qr) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getTicketQr(ticket.ticketCode);
      setQr(response.qrCode);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ticket-card">
      <div className="ticket-card-header">
        <div>
          <div className="ticket-card-title-row">
            <h3 style={{ margin: 0 }}>Ticket</h3>
            <StatusBadge status={ticket.status} />
          </div>
          <Link to={`/events/${ticket.eventId}`}>View event &rarr;</Link>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="field-hint">Purchased</div>
          <div style={{ fontWeight: 600 }}>{formatDate(ticket.purchasedAt)}</div>
        </div>
      </div>

      <div className="ticket-card-code">
        <div className="field-hint">Ticket code</div>
        <span className="ticket-code">{ticket.ticketCode}</span>
      </div>

      <div className="ticket-perforation" aria-hidden="true" />

      <div className="ticket-card-qr-section">
        {qr ? (
          <button
            type="button"
            className="ticket-card-qr-trigger"
            onClick={() => setDetailsOpen(true)}
            aria-label="Open ticket QR code in full view"
          >
            <img src={qr} alt={`QR code for ticket ${ticket.ticketCode}`} />
          </button>
        ) : (
          <div className="ticket-card-qr-placeholder">
            {error ? <Alert variant="error">{error}</Alert> : null}
            <Button variant="outline" size="sm" onClick={loadQr} loading={loading}>
              <QrCodeIcon size={16} /> Show QR code
            </Button>
          </div>
        )}
        <div className="field-hint">
          Present this QR code at the venue for entry.
        </div>
      </div>

      <Modal
        open={detailsOpen}
        title="Ticket details"
        onClose={() => setDetailsOpen(false)}
      >
        <div className="qr-modal">
          {qr ? <img src={qr} alt={`QR code for ticket ${ticket.ticketCode}`} /> : null}
          <div className="qr-modal-info">
            <p>
              <span className="field-hint">Ticket code</span>
              <br />
              <span className="ticket-code">{ticket.ticketCode}</span>
            </p>
            <p>
              <span className="field-hint">Status</span>{" "}
              <StatusBadge status={ticket.status} />
            </p>
            <p>
              <span className="field-hint">Purchased</span>
              <br />
              {formatDate(ticket.purchasedAt)}
            </p>
            {ticket.scannedAt ? (
              <p>
                <span className="field-hint">Scanned at</span>
                <br />
                {formatDate(ticket.scannedAt)}
              </p>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}
