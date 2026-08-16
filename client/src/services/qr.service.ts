import apiClient from "./apiClient";
import type { QrCodeResponse, Ticket } from "../types";

interface TicketResponse {
  message: string;
  ticket: Ticket;
}

export async function getTicketQr(ticketCode: string): Promise<QrCodeResponse> {
  const { data } = await apiClient.get<QrCodeResponse>(`/qr/${ticketCode}`);
  return data;
}

export async function verifyTicket(ticketCode: string): Promise<Ticket> {
  const { data } = await apiClient.patch<TicketResponse>(
    `/qr/${ticketCode}/verify`,
  );
  return data.ticket;
}

export async function scanQrCode(ticketCode: string): Promise<Ticket> {
  const { data } = await apiClient.post<TicketResponse>("/qr/scan", {
    ticketCode,
  });
  return data.ticket;
}
