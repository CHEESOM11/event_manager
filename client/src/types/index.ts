export type Role = "EVENT_CREATOR" | "EVENTEE";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type NotificationType =
  | "EVENT_REMINDER"
  | "TICKET_PURCHASED"
  | "TICKET_SCANNED"
  | "EVENT_CANCELLED"
  | "GENERAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  currency: string;
  totalTickets: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  currency?: string;
  totalTickets: number;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  paymentId: string | null;
  ticketCode: string;
  qrCode: string | null;
  status: TicketStatus;
  purchasedAt: string;
  scannedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  eventId: string;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface TicketOrder {
  message: string;
  eventId: string;
  userId: string;
  quantity: number;
  ticketPrice: number;
  totalAmount: number;
  currency: string;
}

export interface PaymentInitialization {
  message: string;
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerification {
  message: string;
  payment: Payment;
  tickets?: Ticket[];
}

export interface QrCodeResponse {
  message: string;
  ticketCode: string;
  qrCode: string;
}

export interface ShareLinks {
  whatsapp: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  copyLink: string;
}

export interface ShareLinksResponse {
  message: string;
  event: {
    id: string;
    title: string;
  };
  shareLinks: ShareLinks;
}

export interface EventAnalytics {
  eventId: string;
  eventName: string;
  totalTickets: number;
  ticketsSold: number;
  ticketsUsed: number;
  ticketsValid: number;
  ticketsCancelled: number;
  ticketsRemaining: number;
  totalRevenue: number;
}

export interface ApiSource {
  source?: "cache" | "db";
}
