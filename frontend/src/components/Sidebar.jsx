import { NavLink, useNavigate } from "react-router-dom";
import Crest from "./Crest";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  citizen: [
    { to: "/citizen", icon: "📊", label: "Dashboard", end: true },
    { to: "/citizen/report", icon: "📝", label: "Report Crime" },
    { to: "/citizen/reports", icon: "📁", label: "My Reports" },
    { to: "/citizen/map", icon: "🗺️", label: "Crime Map" },
    { to: "/citizen/notifications", icon: "🔔", label: "Notifications" },
    { to: "/citizen/profile", icon: "👤", label: "Profile" }
  ],
  police: [
    { to: "/police", icon: "📊", label: "Dashboard", end: true },
    { to: "/police/cases", icon: "🗂️", label: "Assigned Cases" },
    { to: "/police/map", icon: "🗺️", label: "Crime Map" },
    { to: "/police/notifications", icon: "🔔", label: "Notifications" },
    { to: "/police/profile", icon: "👤", label: "Profile" }
  ],
  admin: [
    { to: "/admin", icon: "📊", label: "Dashboard", end: true },
    { to: "/admin/reports", icon: "🗂️", label: "Manage Reports" },
    { to: "/admin/officers", icon: "👮", label: "Manage Officers" },
    { to: "/admin/users", icon: "🧑‍🤝‍🧑", label: "Manage Citizens" },
    { to: "/admin/map", icon: "🗺️", label: "Crime Map" },
    { to: "/admin/notifications", icon: "🔔", label: "Notifications" },
    { to: "/admin/profile", icon: "👤", label: "Profile" }
  ]
};

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user.role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <Crest size={40} className="crest" />
        <div className="brand-text">
          <strong>NCRS</strong>
          <span>Nepal Crime Reporting System</span>
        </div>
      </div>
      <div className={`sidebar-role ${user.role}`}>{user.role} Panel</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          ⎋ Logout
        </button>
      </div>
    </aside>
  );
}
