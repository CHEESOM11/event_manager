import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EventForm, toEventFormValues } from "../components/events/EventForm";
import { Alert } from "../components/ui/Alert";
import { FullPageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { getEvent, updateEvent } from "../services/event.service";
import type { UpdateEventPayload } from "../types";
import { getErrorMessage } from "../utils/errors";

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: event,
    loading,
    error,
  } = useApi(() => getEvent(id ?? ""), [id]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="container page">
        <Alert variant="error">{error}</Alert>
        <Link to="/my-events">Back to my events</Link>
      </div>
    );
  }

  if (!event) return null;

  const isOwner = user?.id === event.creatorId;

  const handleSubmit = async (payload: UpdateEventPayload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await updateEvent(event.id, payload);
      navigate(`/events/${updated.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit event</h1>
          <p className="page-subtitle">Update the details for this event.</p>
        </div>
      </div>

      {!isOwner ? (
        <Alert variant="error">
          You do not have permission to edit this event.{" "}
          <Link to="/events">Browse events</Link> instead.
        </Alert>
      ) : (
        <div className="form-card">
          <EventForm
            initial={toEventFormValues(event)}
            submitting={submitting}
            error={submitError}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
