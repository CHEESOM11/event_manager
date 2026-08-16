import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BellIcon } from "../ui/icons";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDate } from "../../utils/format";
import type { Notification } from "../../types";

const PREVIEW_LIMIT = 5;

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => setOpen((current) => !current);

  const handleOpenNotification = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    setOpen(false);
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
  };

  const preview = notifications.slice(0, PREVIEW_LIMIT);

  return (
    <div className="notification-bell-wrap" ref={panelRef}>
      <button
        className="notification-bell"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <BellIcon size={20} />
        {unreadCount > 0 ? (
          <span className="notification-badge">{unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="notification-panel-view-all"
            >
              View all
            </Link>
          </div>

          {loading && notifications.length === 0 ? (
            <div className="notification-panel-state">Loading...</div>
          ) : null}

          {!loading && notifications.length === 0 ? (
            <div className="notification-panel-state">
              You're all caught up.
            </div>
          ) : null}

          {notifications.length > 0 ? (
            <div className="notification-panel-list">
              {preview.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification-panel-item${
                    notification.read ? "" : " notification-panel-item--unread"
                  }`}
                  onClick={() => handleOpenNotification(notification)}
                >
                  <span className="notification-panel-item-title">
                    {notification.title}
                    {!notification.read ? (
                      <span className="notification-panel-dot" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="notification-panel-item-message">
                    {notification.message}
                  </span>
                  <span className="notification-panel-item-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
