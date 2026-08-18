import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import CrimeMap from "../components/CrimeMap";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const DETAIL_BASE = { citizen: "/citizen/reports", police: "/police/cases", admin: "/admin/reports" };

export default function CrimeMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("");

  useEffect(() => {
    api
      .get("/reports/map")
      .then((d) => setReports(d.reports))
      .finally(() => setLoading(false));
  }, []);

  const filtered = severity ? reports.filter((r) => r.severity === severity) : reports;
  const counts = {
    High: reports.filter((r) => r.severity === "High").length,
    Medium: reports.filter((r) => r.severity === "Medium").length,
    Low: reports.filter((r) => r.severity === "Low").length
  };

  return (
    <DashboardLayout title="Live Crime Map">
      <div className="page-header">
        <div>
          <h2>🗺️ Live Crime Map — Nepal</h2>
          <p>
            {user.role === "citizen"
              ? "A public safety overview of reported incidents nationwide — tap a pin for a quick summary. Case details are only visible to the citizen who filed the report and to investigating officers."
              : "Real-time visualization of reported incidents across the country. Click a pin to open the full case."}
          </p>
        </div>
        <div className="pill-toggle">
          <button className={severity === "" ? "active" : ""} onClick={() => setSeverity("")}>
            All ({reports.length})
          </button>
          <button className={severity === "High" ? "active" : ""} onClick={() => setSeverity("High")}>
            High ({counts.High})
          </button>
          <button className={severity === "Medium" ? "active" : ""} onClick={() => setSeverity("Medium")}>
            Medium ({counts.Medium})
          </button>
          <button className={severity === "Low" ? "active" : ""} onClick={() => setSeverity("Low")}>
            Low ({counts.Low})
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner page />
      ) : (
        <div className="card card-pad">
          <CrimeMap
            reports={filtered}
            height={520}
            onSelect={user.role === "citizen" ? undefined : (r) => navigate(`${DETAIL_BASE[user.role]}/${r.id}`)}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
