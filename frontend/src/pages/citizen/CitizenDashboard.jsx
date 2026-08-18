import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import { StatusBadge, SeverityBadge } from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/analytics/citizen"), api.get("/reports")])
      .then(([s, r]) => {
        setStats(s);
        setReports(r.reports.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Citizen Dashboard">
      <div className="page-header">
        <div>
          <h2>Hello, {user.name.split(" ")[0]} 👋</h2>
          <p>Welcome to NCRS — report crimes and track your cases here.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/citizen/report" className="btn btn-red">
            📝 Report a Crime
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner page />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="📁" value={stats.total} label="My Reports" accent="navy" />
            <StatCard icon="⏳" value={stats.inProgress} label="In Progress" accent="amber" />
            <StatCard icon="✅" value={stats.solved} label="Solved" accent="green" />
            <StatCard icon="✖" value={stats.rejected} label="Rejected" accent="red" />
          </div>

          <div className="card card-pad">
            <div className="page-header" style={{ marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                🕓 Recent Reports
              </h3>
              <Link to="/citizen/reports" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="ei">📭</div>
                No reports yet. Click "Report a Crime" to file your first report.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => (window.location.href = `/citizen/reports/${r.id}`)}>
                        <td>
                          <Link to={`/citizen/reports/${r.id}`}>{r.caseId}</Link>
                        </td>
                        <td>{r.title}</td>
                        <td>{r.location.address}</td>
                        <td>
                          <SeverityBadge severity={r.severity} />
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
