import type { Role } from "../types";

export function homePathForRole(role: Role): string {
  return role === "EVENT_CREATOR" ? "/my-events" : "/events";
}
