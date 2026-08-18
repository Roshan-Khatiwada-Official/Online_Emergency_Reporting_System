import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, SeverityBadge } from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { api } from "../../api/client";

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/meta/categories").then((d) => setCategories(d.categories));
  }, []);

  useEffect(() => {
    load();
  }, [status, category]);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    api
      .get(`/reports?${params.toString()}`)
      .then((d) => setReports(d.reports))
      .finally(() => setLoading(false));
  }

  const filtered = reports.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.caseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Reports">
      <div className="page-header">
        <div>
          <h2>🗂️ Manage Reports</h2>
          <p>All crime reports submitted across Nepal.</p>
        </div>
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
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
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
                  <th>Officer</th>
                  <th>Status</th>
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
                    <td>{r.officerName || <span className="field-hint">Unassigned</span>}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <Link to={`/admin/reports/${r.id}`} className="btn btn-outline btn-sm">
                        Manage
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
