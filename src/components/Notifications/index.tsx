"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  notificationsApi,
  type NotificationsData,
  ApiRequestError,
} from "@/lib/api";

export default function Notifications() {
  const { token } = useAuth();
  const [data, setData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await notificationsApi.list(authToken);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load notifications.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const markAllRead = async () => {
    if (!token || !data || data.unreadCount === 0) return;
    setMarking(true);
    try {
      await notificationsApi.markAllRead(token);
      setData({
        unreadCount: 0,
        notifications: data.notifications.map((n) => ({ ...n, unread: false })),
      });
    } catch {
      // non-critical
    } finally {
      setMarking(false);
    }
  };

  return (
    <section className="section section-dark" id="notifications">
      <div className="container">
        <div className="flex-between mb-32">
          <div>
            <div className="tag mb-8">Notifications</div>
            <h2>Your Alerts</h2>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={markAllRead}
              disabled={marking || !data || data.unreadCount === 0}
            >
              {data && data.unreadCount > 0
                ? `Mark All Read (${data.unreadCount})`
                : "Mark All Read"}
            </button>
          </div>
        </div>

        {loading && <p className="muted">Loading notifications…</p>}
        {error && (
          <div className="alert alert-error">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && data && (
          <div className="card" style={{ maxWidth: "760px" }}>
            {data.notifications.length === 0 ? (
              <p className="muted" style={{ padding: "12px" }}>
                You have no notifications yet. Activity on your account will
                appear here.
              </p>
            ) : (
              data.notifications.map((notif) => (
                <div
                  className={notif.unread ? "notif-item notif-unread" : "notif-item"}
                  key={notif.id}
                >
                  <div className="notif-icon" style={{ background: notif.iconBg }}>
                    {notif.icon}
                  </div>
                  <div className="notif-body">
                    <h5>{notif.title}</h5>
                    <p>{notif.body}</p>
                    <div className="time">{notif.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
