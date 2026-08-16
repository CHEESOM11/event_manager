import apiClient from "./apiClient";
import type { Notification } from "../types";

interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}

interface NotificationResponse {
  message: string;
  notification: Notification;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<NotificationsResponse>("/notifications");
  return data.notifications;
}

export async function markNotificationAsRead(
  id: string,
): Promise<Notification> {
  const { data } = await apiClient.patch<NotificationResponse>(
    `/notifications/${id}/read`,
  );
  return data.notification;
}
