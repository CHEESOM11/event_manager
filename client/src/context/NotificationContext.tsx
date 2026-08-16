import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as notificationService from "../services/notification.service";
import type { Notification } from "../types";
import { useAuth } from "../hooks/useAuth";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch {
      // Notifications are non-critical; fail silently.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, refresh, markAsRead }),
    [notifications, unreadCount, loading, refresh, markAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
