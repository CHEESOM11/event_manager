export interface PendingPayment {
  reference: string;
  eventId: string;
  quantity: number;
  eventTitle: string;
}

const PENDING_PAYMENT_KEY = "eventful_pending_payment";

export function savePendingPayment(payment: PendingPayment): void {
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
}

export function getPendingPayment(): PendingPayment | null {
  const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
}

export function clearPendingPayment(): void {
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
}
