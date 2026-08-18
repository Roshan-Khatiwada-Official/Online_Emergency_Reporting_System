import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, SeverityBadge } from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { api } from "../../api/client";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [status]);

  function load() {
    setLoading(true);
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    api
      .get(`/reports${q}`)
      .then((d) => setReports(d.reports))
      .finally(() => setLoading(false));
  }

  const filtered = reports.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.caseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="My Reports">
      <div className="page-header">
        <div>
          <h2>📁 My Reports</h2>
          <p>All crime reports you have filed.</p>
        </div>
        <Link to="/citizen/report" className="btn btn-red">
          📝 New Report
        </Link>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by case ID or title..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Accepted">Accepted</option>
          <option value="In Progress">In Progress</option>
          <option value="Solved">Solved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Spinner page />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ei">📭</div>
            No reports found.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Crime Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.caseId}</td>
                    <td>
                      {r.categoryIcon} {r.categoryName}
                    </td>
                    <td>{r.location.address}</td>
                    <td>
                      <SeverityBadge severity={r.severity} />
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/citizen/reports/${r.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
