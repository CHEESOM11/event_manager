import apiClient from "./apiClient";
import type { PaymentInitialization, PaymentVerification } from "../types";

export interface InitializePaymentPayload {
  email: string;
  amount: number;
  eventId: string;
  quantity: number;
}

export async function initializePayment(
  payload: InitializePaymentPayload,
): Promise<PaymentInitialization> {
  const { data } = await apiClient.post<PaymentInitialization>(
    "/payments/initialize",
    payload,
  );
  return data;
}

export async function verifyPayment(
  reference: string,
): Promise<PaymentVerification> {
  const { data } = await apiClient.get<PaymentVerification>(
    `/payments/verify/${reference}`,
  );
  return data;
}
