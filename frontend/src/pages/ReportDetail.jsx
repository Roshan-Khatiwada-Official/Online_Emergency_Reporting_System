import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import CrimeMap from "../components/CrimeMap";
import Spinner from "../components/Spinner";
import { StatusBadge, SeverityBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

const STATUS_FLOW = ["Submitted", "Accepted", "In Progress", "Solved", "Rejected", "Closed"];

function timelineClass(status) {
  if (status === "Solved" || status === "Closed") return "solved";
  if (status === "Rejected") return "rejected";
  return "";
}

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusForm, setStatusForm] = useState({ status: "", note: "" });
  const [officers, setOfficers] = useState([]);
  const [assignForm, setAssignForm] = useState({ officerId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    if (user.role === "admin") {
      api.get("/users/officers").then((d) => setOfficers(d.officers)).catch(() => {});
    }
  }, [id]);

  function load() {
    setLoading(true);
    api
      .get(`/reports/${id}`)
      .then((d) => {
        setReport(d.report);
        setHistory(d.history);
        setStatusForm({ status: d.report.status, note: "" });
        setAssignForm({ officerId: d.report.assignedOfficerId || "" });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function updateStatus(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/reports/${id}/status`, statusForm);
      await load();
      showToast(`Case status updated to "${statusForm.status}".`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function assignOfficer(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/reports/${id}/assign`, { officerId: assignForm.officerId, stationId: report.stationId });
      await load();
      showToast(assignForm.officerId ? "Officer assigned successfully." : "Case unassigned.", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Case Details">
        <Spinner page />
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout title="Case Details">
        <div className="alert alert-error">{error || "Report not found."}</div>
      </DashboardLayout>
    );
  }

  const canUpdateStatus = user.role === "admin" || (user.role === "police" && report.assignedOfficerId === user.id);
  const canAssign = user.role === "admin";

  return (
    <DashboardLayout title="Case Details">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="page-header">
        <div>
          <h2>
            {report.categoryIcon} {report.title}
          </h2>
          <p>
            Case ID: <b>{report.caseId}</b> · Filed {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
          {report.isSOS && <span className="badge badge-high">🚨 SOS</span>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card card-pad">
            <h3 className="section-title">Description</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{report.description}</p>

            <div className="form-row" style={{ marginTop: 16 }}>
              <div>
                <div className="field-hint">Crime Type</div>
                <div style={{ fontWeight: 600 }}>{report.categoryName}</div>
              </div>
              <div>
                <div className="field-hint">Location</div>
                <div style={{ fontWeight: 600 }}>{report.location.address}</div>
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 12 }}>
              <div>
                <div className="field-hint">Police Station</div>
                <div style={{ fontWeight: 600 }}>{report.stationName}</div>
              </div>
              <div>
                <div className="field-hint">Assigned Officer</div>
                <div style={{ fontWeight: 600 }}>{report.officerName || "Not yet assigned"}</div>
              </div>
            </div>

            {(user.role === "police" || user.role === "admin") && (
              <div className="form-row" style={{ marginTop: 12 }}>
                <div>
                  <div className="field-hint">Reported By</div>
                  <div style={{ fontWeight: 600 }}>{report.reporterName}</div>
                </div>
                <div>
                  <div className="field-hint">Contact Phone</div>
                  <div style={{ fontWeight: 600 }}>{report.reporterPhone}</div>
                </div>
              </div>
            )}
          </div>

          {report.evidence?.length > 0 && (
            <div className="card card-pad">
              <h3 className="section-title">📷 Evidence ({report.evidence.length})</h3>
              <div className="evidence-thumbs">
                {report.evidence.map((ev) => (
                  <a key={ev.id} href={ev.url} target="_blank" rel="noreferrer" className="thumb" title={ev.originalName}>
                    {ev.type?.startsWith("image") ? <img src={ev.url} alt={ev.originalName} /> : "📄"}
                  </a>
                ))}
              </div>
            </div>
          )}

          {report.location.lat && report.location.lng && (
            <div className="card card-pad">
              <h3 className="section-title">📍 Incident Location</h3>
              <CrimeMap reports={[report]} height={280} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {canAssign && (
            <div className="card card-pad">
              <h3 className="section-title">👮 Assign Officer</h3>
              <form onSubmit={assignOfficer}>
                <div className="form-group">
                  <select value={assignForm.officerId} onChange={(e) => setAssignForm({ officerId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.rank || "Officer"})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary btn-block btn-sm" disabled={saving}>
                  Save Assignment
                </button>
              </form>
            </div>
          )}

          {canUpdateStatus && (
            <div className="card card-pad">
              <h3 className="section-title">🔄 Update Status</h3>
              <form onSubmit={updateStatus}>
                <div className="form-group">
                  <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Add an investigation note (optional)"
                    value={statusForm.note}
                    onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                  />
                </div>
                <button className="btn btn-primary btn-block btn-sm" disabled={saving}>
                  {saving ? "Saving..." : "Update Status"}
                </button>
              </form>
            </div>
          )}

          <div className="card card-pad">
            <h3 className="section-title">🎫 Case Timeline</h3>
            <div className="timeline">
              {history.map((h) => (
                <div className={`timeline-item ${timelineClass(h.status)}`} key={h.id}>
                  <div className="timeline-dot" />
                  <div className="timeline-status">{h.status}</div>
                  <div className="timeline-note">{h.note}</div>
                  <div className="timeline-time">{new Date(h.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
