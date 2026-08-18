import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", rank: "Constable", badgeNumber: "", stationId: "" };

export default function ManageOfficers() {
  const { showToast } = useToast();
  const [officers, setOfficers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    load();
    api.get("/meta/stations").then((d) => setStations(d.stations));
  }, []);

  function load() {
    setLoading(true);
    api
      .get("/users?role=police")
      .then((d) => setOfficers(d.users))
      .finally(() => setLoading(false));
  }

  function stationName(id) {
    return stations.find((s) => s.id === Number(id))?.name || "Unassigned";
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/users", { ...form, role: "police" });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
      showToast(`Officer account created for ${form.name}.`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(o) {
    const nextStatus = o.status === "active" ? "suspended" : "active";
    try {
      await api.put(`/users/${o.id}`, { status: nextStatus });
      load();
      showToast(`${o.name} ${nextStatus === "active" ? "activated" : "suspended"}.`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDelete() {
    try {
      await api.del(`/users/${confirmDelete.id}`);
      showToast(`${confirmDelete.name} removed.`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
    setConfirmDelete(null);
    load();
  }

  return (
    <DashboardLayout title="Manage Officers">
      <div className="page-header">
        <div>
          <h2>👮 Manage Police Officers</h2>
          <p>Onboard and manage officer accounts across police stations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Officer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner page />
        ) : officers.length === 0 ? (
          <div className="empty-state">
            <div className="ei">👮</div>
            No officers added yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Badge No.</th>
                  <th>Rank</th>
                  <th>Station</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {officers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.name}</td>
                    <td>{o.badgeNumber}</td>
                    <td>{o.rank}</td>
                    <td>{stationName(o.stationId)}</td>
                    <td>{o.email}</td>
                    <td>
                      <span className={`badge ${o.status === "active" ? "badge-solved" : "badge-rejected"}`}>{o.status}</span>
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(o)}>
                        {o.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button className="btn btn-red btn-sm" onClick={() => setConfirmDelete(o)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Add Police Officer" onClose={() => setShowForm(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Badge Number</label>
                <input required value={form.badgeNumber} onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rank</label>
                <select value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })}>
                  <option>Constable</option>
                  <option>Head Constable</option>
                  <option>Sub-Inspector</option>
                  <option>Inspector</option>
                  <option>DSP</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Police Station</label>
              <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })}>
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Creating..." : "Create Officer Account"}
            </button>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Delete Officer"
          onClose={() => setConfirmDelete(null)}
          actions={
            <>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-red" onClick={handleDelete}>
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete <b>{confirmDelete.name}</b>? This cannot be undone.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  );
}
