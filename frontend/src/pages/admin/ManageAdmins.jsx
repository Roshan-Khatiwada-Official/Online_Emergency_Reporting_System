import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", address: "" };

export default function ManageAdmins() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api
      .get("/users?role=admin")
      .then((d) => setAdmins(d.users))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/users", { ...form, role: "admin" });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
      showToast(`Admin account created for ${form.name}.`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(a) {
    const nextStatus = a.status === "active" ? "suspended" : "active";
    try {
      await api.put(`/users/${a.id}`, { status: nextStatus });
      load();
      showToast(`${a.name} ${nextStatus === "active" ? "activated" : "suspended"}.`, "success");
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
    <DashboardLayout title="Manage Admins">
      <div className="page-header">
        <div>
          <h2>🛡️ Manage Admins</h2>
          <p>Other people who can administer NCRS alongside you.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Admin
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner page />
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🛡️</div>
            No admins found.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => {
                  const isSelf = a.id === user.id;
                  return (
                    <tr key={a.id}>
                      <td>
                        {a.name} {isSelf && <span className="field-hint">(you)</span>}
                      </td>
                      <td>{a.email}</td>
                      <td>{a.phone}</td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${a.status === "active" ? "badge-solved" : "badge-rejected"}`}>{a.status}</span>
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(a)} disabled={isSelf}>
                          {a.status === "active" ? "Suspend" : "Activate"}
                        </button>
                        <button className="btn btn-red btn-sm" onClick={() => setConfirmDelete(a)} disabled={isSelf}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Add Admin" onClose={() => setShowForm(false)}>
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
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Creating..." : "Create Admin Account"}
            </button>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Delete Admin"
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
