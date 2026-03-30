import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AppProviders";
import apiClient, {
  DASHBOARD_REFRESH_EVENT,
  emitDashboardRefresh,
  getListData,
} from "./appCore";

async function listNotifications(params = {}) {
  const response = await apiClient.get("notifications/", { params });
  return {
    items: getListData(response.data),
    count: response.data?.count || 0,
    next: response.data?.next || null,
    previous: response.data?.previous || null,
  };
}

async function getUnreadNotificationCount() {
  const response = await apiClient.get("notifications/unread-count/");
  return response.data.unread_count || 0;
}

async function markNotificationRead(id) {
  const response = await apiClient.patch(`notifications/${id}/read/`);
  return response.data;
}

async function markAllNotificationsRead() {
  const response = await apiClient.patch("notifications/mark-all-read/");
  return response.data;
}

function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return undefined;
    }

    let cancelled = false;

    async function tick() {
      if (runningRef.current || cancelled) {
        return;
      }

      runningRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        runningRef.current = false;
      }
    }

    const intervalId = window.setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}

function timeAgo(value) {
  if (!value) {
    return "";
  }

  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) return "just now";
  if (absMinutes < 60) return `${absMinutes}m ago`;

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return `${absHours}h ago`;

  const absDays = Math.round(absHours / 24);
  return `${absDays}d ago`;
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 17H5.79a1 1 0 0 1-.77-1.63l1.48-1.78V10a5.5 5.5 0 1 1 11 0v3.59l1.48 1.78A1 1 0 0 1 18.21 17H15Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { extractErrorMessage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const hasNotifications = useMemo(() => notifications.length > 0, [notifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to load notifications."));
    }
  }, [extractErrorMessage]);

  const fetchNotifications = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError("");
        const [response, count] = await Promise.all([
          listNotifications({ page_size: 8 }),
          getUnreadNotificationCount(),
        ]);
        setNotifications(response.items);
        setUnreadCount(count);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Unable to load notifications."));
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [extractErrorMessage]
  );

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  usePolling(fetchUnreadCount, 10000, true);
  usePolling(() => fetchNotifications(false), 10000, isOpen);

  useEffect(() => {
    function handleRefreshEvent() {
      fetchNotifications(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchNotifications(false);
      }
    }

    window.addEventListener(DASHBOARD_REFRESH_EVENT, handleRefreshEvent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, handleRefreshEvent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.is_read) {
        const response = await markNotificationRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? response.notification : item
          )
        );
        setUnreadCount(response.unread_count);
        emitDashboardRefresh({ source: "notification-read" });
      }
    } catch {
      // Keep navigation responsive even if mark-read fails.
    }

    setIsOpen(false);

    if (notification.related_expense) {
      navigate(`/expenses/${notification.related_expense}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(response.unread_count || 0);
      emitDashboardRefresh({ source: "notifications-mark-all-read" });
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to mark all notifications as read."));
    }
  };

  return (
    <div className="relative z-50 shrink-0">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            fetchNotifications(false);
          }
        }}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:shadow-md"
      >
        <BellIcon />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg z-50">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              <p className="mt-1 text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!unreadCount}
              className="text-xs font-medium text-blue-900 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto">
            {loading ? (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : hasNotifications ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpenNotification(notification)}
                  className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                    notification.is_read
                      ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      : "border-blue-100 bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {notification.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-gray-500">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {notification.message}
                  </p>
                  {notification.related_expense_reference ? (
                    <p className="mt-2 text-[11px] font-medium text-blue-900">
                      Open {notification.related_expense_reference}
                    </p>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
