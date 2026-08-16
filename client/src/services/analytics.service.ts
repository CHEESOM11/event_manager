import apiClient from "./apiClient";
import type { ApiSource, EventAnalytics } from "../types";

interface AnalyticsResponse extends ApiSource {
  message: string;
  analytics: EventAnalytics;
}

export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> {
  const { data } = await apiClient.get<AnalyticsResponse>(
    `/analytics/events/${eventId}`,
  );
  return data.analytics;
}
