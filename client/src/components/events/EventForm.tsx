import { useState, type FormEvent } from "react";
import type { CreateEventPayload, Event } from "../../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: string;
  currency: string;
  totalTickets: string;
}

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];

function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toEventFormValues(event: Event): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: toLocalInputValue(event.startDate),
    endDate: toLocalInputValue(event.endDate),
    ticketPrice: String(event.ticketPrice),
    currency: event.currency,
    totalTickets: String(event.totalTickets),
  };
}

interface EventFormProps {
  initial?: EventFormValues | null;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (payload: CreateEventPayload) => void;
}

export function EventForm({
  initial,
  submitting,
  error,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(
    initial ?? {
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      ticketPrice: "",
      currency: "NGN",
      totalTickets: "",
    },
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const setField = (field: keyof EventFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!values.title.trim()) errors.title = "Title is required";
    if (!values.description.trim()) errors.description = "Description is required";
    if (!values.location.trim()) errors.location = "Location is required";
    if (!values.startDate) errors.startDate = "Start date is required";
    if (!values.endDate) errors.endDate = "End date is required";
    if (
      values.startDate &&
      values.endDate &&
      new Date(values.endDate) <= new Date(values.startDate)
    ) {
      errors.endDate = "End date must be after start date";
    }
    const price = Number(values.ticketPrice);
    if (values.ticketPrice === "" || Number.isNaN(price) || price < 0) {
      errors.ticketPrice = "Enter a valid non-negative price";
    }
    const total = Number(values.totalTickets);
    if (values.totalTickets === "" || Number.isNaN(total) || total <= 0) {
      errors.totalTickets = "Must be greater than zero";
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      ticketPrice: Number(values.ticketPrice),
      currency: values.currency,
      totalTickets: Number(values.totalTickets),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Input
        label="Title"
        name="title"
        placeholder="e.g. Afrobeats Night Lagos"
        value={values.title}
        onChange={(event) => setField("title", event.target.value)}
        error={localErrors.title}
      />

      <Textarea
        label="Description"
        name="description"
        placeholder="Describe the experience for attendees..."
        value={values.description}
        onChange={(event) => setField("description", event.target.value)}
        error={localErrors.description}
      />

      <Input
        label="Location"
        name="location"
        placeholder="e.g. Eko Convention Centre, Lagos"
        value={values.location}
        onChange={(event) => setField("location", event.target.value)}
        error={localErrors.location}
      />

      <div className="event-form-grid">
        <Input
          label="Start date & time"
          type="datetime-local"
          name="startDate"
          value={values.startDate}
          onChange={(event) => setField("startDate", event.target.value)}
          error={localErrors.startDate}
        />
        <Input
          label="End date & time"
          type="datetime-local"
          name="endDate"
          value={values.endDate}
          onChange={(event) => setField("endDate", event.target.value)}
          error={localErrors.endDate}
        />
      </div>

      <div className="event-form-grid">
        <Input
          label="Ticket price"
          type="number"
          min="0"
          step="any"
          name="ticketPrice"
          placeholder="0"
          value={values.ticketPrice}
          onChange={(event) => setField("ticketPrice", event.target.value)}
          error={localErrors.ticketPrice}
        />
        <Select
          label="Currency"
          name="currency"
          value={values.currency}
          onChange={(event) => setField("currency", event.target.value)}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Total tickets"
        type="number"
        min="1"
        step="1"
        name="totalTickets"
        placeholder="100"
        value={values.totalTickets}
        onChange={(event) => setField("totalTickets", event.target.value)}
        error={localErrors.totalTickets}
        hint="Number of tickets available for sale"
      />

      <Button type="submit" block size="lg" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
