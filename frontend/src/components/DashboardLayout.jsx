import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={open} />
      <div className="main-area">
        <Topbar title={title} onMenuClick={() => setOpen((o) => !o)} />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
