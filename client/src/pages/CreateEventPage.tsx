import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventForm } from "../components/events/EventForm";
import { createEvent } from "../services/event.service";
import type { CreateEventPayload } from "../types";
import { getErrorMessage } from "../utils/errors";

export function CreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateEventPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const event = await createEvent(payload);
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create an event</h1>
          <p className="page-subtitle">
            Fill in the details below to publish a new experience.
          </p>
        </div>
      </div>

      <div className="form-card">
        <EventForm
          submitting={submitting}
          error={error}
          submitLabel="Create event"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
