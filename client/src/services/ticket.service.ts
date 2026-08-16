import apiClient from "./apiClient";
import type { Ticket, TicketOrder } from "../types";

interface TicketOrderResponse {
  message: string;
  eventId: string;
  userId: string;
  quantity: number;
  ticketPrice: number;
  totalAmount: number;
  currency: string;
}

interface TicketsResponse {
  message: string;
  tickets: Ticket[];
}

export async function createTicketOrder(
  eventId: string,
  quantity: number,
): Promise<TicketOrder> {
  const { data } = await apiClient.post<TicketOrderResponse>(
    `/events/${eventId}/tickets`,
    { quantity },
  );
  return data;
}

export async function getMyTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<TicketsResponse>("/my-tickets");
  return data.tickets;
}
