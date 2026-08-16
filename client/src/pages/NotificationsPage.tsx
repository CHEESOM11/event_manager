import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { BellIcon } from "../components/ui/icons";
import { useNotifications } from "../hooks/useNotifications";
import { formatDate } from "../utils/format";

export function NotificationsPage() {
  const { notifications, loading, markAsRead } = useNotifications();

  const unread = notifications.filter((notification) => !notification.read);

  const handleMarkAll = async () => {
    await Promise.all(unread.map((notification) => markAsRead(notification.id)));
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Updates about your tickets and events.
          </p>
        </div>
        {unread.length > 0 ? (
          <Button variant="outline" onClick={handleMarkAll}>
            Mark all as read
          </Button>
        ) : null}
      </div>

      {loading ? <p className="field-hint">Loading notifications...</p> : null}

      {!loading && notifications.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={48} />}
          title="No notifications"
          text="You're all caught up. Notifications about your tickets and events will appear here."
        />
      ) : null}

      {!loading && notifications.length > 0 ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {notifications.map((notification) => {
            const isRead = notification.read;
            return (
              <button
                key={notification.id}
                type="button"
                className={`notification-item${isRead ? "" : " notification-item--unread"}`}
                onClick={() => {
                  if (!isRead) markAsRead(notification.id);
                }}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <span className="field-hint">{formatDate(notification.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
