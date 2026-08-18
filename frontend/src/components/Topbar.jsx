import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Modal from "./Modal";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.get("/notifications");
        if (!cancelled) setUnread(data.notifications.filter((n) => !n.isRead).length);
      } catch {
        /* ignore */
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function triggerSOS() {
    setSosStatus("sending");
    const send = async (lat, lng) => {
      try {
        await api.post("/reports/sos", { lat, lng, address: lat ? `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}` : "" });
        setSosStatus("sent");
      } catch {
        setSosStatus("error");
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => send(pos.coords.latitude, pos.coords.longitude),
        () => send(null, null),
        { timeout: 5000 }
      );
    } else {
      send(null, null);
    }
  }

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-ghost btn-sm" style={{ display: "none" }} onClick={onMenuClick}>
          ☰
        </button>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        {user.role === "citizen" && (
          <button
            className="sos-btn"
            onClick={() => {
              setSosOpen(true);
              setSosStatus("idle");
            }}
          >
            🚨 Emergency SOS
          </button>
        )}
        <button className="bell-btn" onClick={() => navigate(`/${user.role}/notifications`)} title="Notifications">
          🔔
          {unread > 0 && <span className="bell-dot" />}
        </button>
        <div className="topbar-user">
          <div className="avatar">{initials(user.name)}</div>
          <div>
            <div className="name">{user.name}</div>
            <div className="role">{user.role}</div>
          </div>
        </div>
      </div>

      {sosOpen && (
        <Modal
          title="🚨 Emergency SOS"
          onClose={() => setSosOpen(false)}
          actions={
            sosStatus === "sent" ? (
              <button className="btn btn-primary" onClick={() => setSosOpen(false)}>
                Close
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => setSosOpen(false)} disabled={sosStatus === "sending"}>
                  Cancel
                </button>
                <button className="btn btn-red" onClick={triggerSOS} disabled={sosStatus === "sending"}>
                  {sosStatus === "sending" ? "Sending..." : "Send SOS Alert"}
                </button>
              </>
            )
          }
        >
          {sosStatus === "sent" ? (
            <p>Your emergency alert has been sent to the nearest police station with your location. Help is on the way.</p>
          ) : sosStatus === "error" ? (
            <p style={{ color: "var(--nepal-red)" }}>Failed to send SOS. Please try again or call 100 directly.</p>
          ) : (
            <p>This will immediately notify the nearest police station of your live location as a high-priority emergency. Use only in genuine emergencies.</p>
          )}
        </Modal>
      )}
    </header>
  );
}
