import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

const DETAIL_BASE = { citizen: "/citizen/reports", police: "/police/cases", admin: "/admin/reports" };

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api
      .get("/notifications")
      .then((d) => setNotifications(d.notifications))
      .finally(() => setLoading(false));
  }

  async function openNotification(n) {
    if (!n.isRead) {
      await api.put(`/notifications/${n.id}/read`);
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    if (n.relatedReportId) navigate(`${DETAIL_BASE[user.role]}/${n.relatedReportId}`);
  }

  async function markAllRead() {
    await api.put("/notifications/read-all");
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    showToast("All notifications marked as read.", "success");
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="page-header">
        <div>
          <h2>🔔 Notifications</h2>
          <p>Stay updated on your case activity.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner page />
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🔕</div>
            No notifications yet.
          </div>
        ) : (
          <ul className="notif-list">
            {notifications.map((n) => (
              <li key={n.id} className={`notif-item ${n.isRead ? "" : "unread"}`} onClick={() => openNotification(n)}>
                <div className="notif-icon">{n.title.includes("SOS") ? "🚨" : "🔔"}</div>
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
