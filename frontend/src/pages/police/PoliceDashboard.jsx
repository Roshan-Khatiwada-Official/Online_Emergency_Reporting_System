import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import { StatusBadge, SeverityBadge } from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

export default function PoliceDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/analytics/police"), api.get("/reports?mine=true")])
      .then(([s, r]) => {
        setStats(s);
        setCases(r.reports.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Police Dashboard">
      <div className="page-header">
        <div>
          <h2>Welcome, {user.name} 👮</h2>
          <p>
            {user.rank} · Badge {user.badgeNumber}
          </p>
        </div>
        <Link to="/police/cases" className="btn btn-primary">
          🗂️ View All Cases
        </Link>
      </div>

      {loading ? (
        <Spinner page />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="🗂️" value={stats.assigned} label="Assigned Cases" accent="navy" />
            <StatCard icon="🕓" value={stats.accepted} label="Accepted" accent="blue" />
            <StatCard icon="⏳" value={stats.inProgress} label="In Progress" accent="amber" />
            <StatCard icon="✅" value={stats.solved} label="Solved" accent="green" />
          </div>

          <div className="card card-pad">
            <h3 className="section-title">🗂️ Recent Assigned Cases</h3>
            {cases.length === 0 ? (
              <div className="empty-state">
                <div className="ei">📭</div>
                No cases assigned to you yet.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Crime Type</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id}>
                        <td>{c.caseId}</td>
                        <td>
                          {c.categoryIcon} {c.categoryName}
                        </td>
                        <td>{c.location.address}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <Link to={`/police/cases/${c.id}`} className="btn btn-outline btn-sm">
                            Open
                          </Link>
                        </td>
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
