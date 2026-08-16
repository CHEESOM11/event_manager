import apiClient from "./apiClient";
import type {
  ApiSource,
  CreateEventPayload,
  Event,
  ShareLinksResponse,
  UpdateEventPayload,
} from "../types";

interface EventListResponse extends ApiSource {
  message: string;
  events: Event[];
}

interface EventResponse extends ApiSource {
  message: string;
  event: Event;
}

export async function getEvents(): Promise<Event[]> {
  const { data } = await apiClient.get<EventListResponse>("/events");
  return data.events;
}

export async function getEvent(id: string): Promise<Event> {
  const { data } = await apiClient.get<EventResponse>(`/events/${id}`);
  return data.event;
}

export async function getMyEvents(): Promise<Event[]> {
  const { data } = await apiClient.get<EventListResponse>("/events/my-events");
  return data.events;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const { data } = await apiClient.post<EventResponse>("/events", payload);
  return data.event;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<Event> {
  const { data } = await apiClient.patch<EventResponse>(`/events/${id}`, payload);
  return data.event;
}

export async function cancelEvent(id: string): Promise<Event> {
  const { data } = await apiClient.patch<EventResponse>(`/events/${id}/cancel`);
  return data.event;
}

export async function getShareLinks(id: string): Promise<ShareLinksResponse> {
  const { data } = await apiClient.get<ShareLinksResponse>(`/events/${id}/share`);
  return data;
}
