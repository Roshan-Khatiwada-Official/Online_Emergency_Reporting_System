import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, SeverityBadge } from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { api } from "../../api/client";

export default function PoliceCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine");

  useEffect(() => {
    load();
  }, [status, scope]);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (scope === "mine") params.set("mine", "true");
    api
      .get(`/reports?${params.toString()}`)
      .then((d) => setCases(d.reports))
      .finally(() => setLoading(false));
  }

  const filtered = cases.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.caseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Assigned Cases">
      <div className="page-header">
        <div>
          <h2>🗂️ Cases</h2>
          <p>Investigate and update the status of crime reports.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="pill-toggle">
          <button className={scope === "mine" ? "active" : ""} onClick={() => setScope("mine")}>
            Assigned to Me
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            All Cases
          </button>
        </div>
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
            No cases found.
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
                  <th>Reporter</th>
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
                    <td>{r.reporterName}</td>
                    <td>
                      <Link to={`/police/cases/${r.id}`} className="btn btn-outline btn-sm">
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
    </DashboardLayout>
  );
}
