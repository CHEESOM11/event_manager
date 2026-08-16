import { AxiosError } from "axios";

interface ErrorPayload {
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (payload?.message) return payload.message;

    if (!error.response) {
      return "Cannot reach the server. Please check your connection.";
    }

    return `Request failed with status ${error.response.status}`;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
