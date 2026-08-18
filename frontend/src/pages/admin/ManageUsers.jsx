import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

export default function ManageUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api
      .get("/users?role=citizen")
      .then((d) => setUsers(d.users))
      .finally(() => setLoading(false));
  }

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleStatus(u) {
    const nextStatus = u.status === "active" ? "suspended" : "active";
    try {
      await api.put(`/users/${u.id}`, { status: nextStatus });
      load();
      showToast(`${u.name} ${nextStatus === "active" ? "activated" : "suspended"}.`, "success");
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
    <DashboardLayout title="Manage Citizens">
      <div className="page-header">
        <div>
          <h2>🧑‍🤝‍🧑 Manage Citizens</h2>
          <p>Registered citizen accounts.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <Spinner page />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🧑</div>
            No citizens found.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.district || "—"}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${u.status === "active" ? "badge-solved" : "badge-rejected"}`}>{u.status}</span>
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(u)}>
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button className="btn btn-red btn-sm" onClick={() => setConfirmDelete(u)}>
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

      {confirmDelete && (
        <Modal
          title="Delete User"
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
