import type { EventStatus, TicketStatus } from "../../types";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeInfo {
  label: string;
  tone: BadgeTone;
}

function resolveBadge(status: EventStatus | TicketStatus): BadgeInfo {
  switch (status) {
    case "PUBLISHED":
      return { label: "Published", tone: "success" };
    case "DRAFT":
      return { label: "Draft", tone: "neutral" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "danger" };
    case "COMPLETED":
      return { label: "Completed", tone: "info" };
    case "VALID":
      return { label: "Valid", tone: "success" };
    case "USED":
      return { label: "Used", tone: "info" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function StatusBadge({
  status,
}: {
  status: EventStatus | TicketStatus;
}) {
  const { label, tone } = resolveBadge(status);
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
