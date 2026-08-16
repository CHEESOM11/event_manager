import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { QrCodeIcon } from "../components/ui/icons";
import { Input } from "../components/ui/Input";
import { getEvent } from "../services/event.service";
import { scanQrCode } from "../services/qr.service";
import type { Event, Ticket } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";

export function ScannerPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Ticket | null>(null);
  const [resultEvent, setResultEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) {
      setResultEvent(null);
      return;
    }

    let active = true;
    getEvent(result.eventId)
      .then((event) => {
        if (active) setResultEvent(event);
      })
      .catch(() => {
        // Event name is optional context for the scan result.
      });

    return () => {
      active = false;
    };
  }, [result]);

  const handleScan = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticketCode.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const ticket = await scanQrCode(ticketCode.trim());
      setResult(ticket);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setTicketCode("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan tickets</h1>
          <p className="page-subtitle">
            Enter a ticket code at the gate to validate entry.
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <Card>
            <CardBody>
              <form onSubmit={handleScan}>
                <Input
                  label="Ticket code"
                  placeholder="Paste the ticket code here"
                  value={ticketCode}
                  onChange={(event) => setTicketCode(event.target.value)}
                  hint="The code is found on the attendee's ticket, below their QR code."
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.625rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Button type="submit" loading={scanning}>
                    <QrCodeIcon size={18} /> Verify ticket
                  </Button>
                  {result || error ? (
                    <Button variant="outline" onClick={reset}>
                      Scan another
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div>
          {error ? (
            <Alert variant="error">{error}</Alert>
          ) : result ? (
            <Card>
              <CardBody>
                <h3 className="section-title">Ticket verified</h3>
                {resultEvent ? (
                  <p style={{ marginTop: 0 }}>
                    <strong>{resultEvent.title}</strong>
                    <br />
                    <span className="field-hint">{resultEvent.location}</span>
                  </p>
                ) : null}
                <div className="scan-result">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="scan-result-status">{result.status}</span>
                  </p>
                  <p>
                    <strong>Code:</strong>{" "}
                    <span className="ticket-code">{result.ticketCode}</span>
                  </p>
                  <p>
                    <strong>Scanned at:</strong>{" "}
                    {result.scannedAt ? formatDate(result.scannedAt) : "Now"}
                  </p>
                  {result.status === "USED" ? (
                    <Alert variant="warning">
                      This ticket has already been used and cannot be reused.
                    </Alert>
                  ) : null}
                </div>
                <Link
                  to={`/events/${result.eventId}`}
                  className="btn btn--outline btn--sm"
                >
                  View event
                </Link>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <p className="field-hint" style={{ margin: 0 }}>
                  Scan results will appear here. Only tickets for events you
                  created can be validated.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
