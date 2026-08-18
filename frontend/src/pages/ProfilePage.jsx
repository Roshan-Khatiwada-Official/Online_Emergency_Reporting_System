import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [provinces, setProvinces] = useState([]);
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address, province: user.province, district: user.district });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/meta/districts").then((d) => setProvinces(d.provinces));
  }, []);

  const districtOptions = provinces.find((p) => p.province === form.province)?.districts || [];

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.put("/auth/profile", form);
      await refreshUser();
      setMsg("success:Profile updated successfully.");
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      setMsg(`error:${err.message}`);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg("error:New passwords do not match.");
      return;
    }
    try {
      await api.put("/auth/change-password", pwForm);
      setPwMsg("success:Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully.", "success");
    } catch (err) {
      setPwMsg(`error:${err.message}`);
      showToast(err.message, "error");
    }
  }

  return (
    <DashboardLayout title="Profile">
      <div className="page-header">
        <h2>👤 My Profile</h2>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div className="avatar-lg">{initials(user.name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
              <div className="field-hint" style={{ textTransform: "capitalize" }}>
                {user.role} {user.badgeNumber ? `· Badge ${user.badgeNumber}` : ""}
              </div>
              <div className="field-hint">{user.email}</div>
            </div>
          </div>

          {msg && <div className={`alert alert-${msg.startsWith("success") ? "success" : "error"}`}>{msg.split(":").slice(1).join(":")}</div>}

          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Province</label>
                <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value, district: "" })}>
                  <option value="">Select province</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.province}>
                      {p.province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>District</label>
                <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                  <option value="">Select district</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="card card-pad">
          <h3 className="section-title">🔒 Change Password</h3>
          {pwMsg && <div className={`alert alert-${pwMsg.startsWith("success") ? "success" : "error"}`}>{pwMsg.split(":").slice(1).join(":")}</div>}
          <form onSubmit={changePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
            </div>
            <button className="btn btn-outline">Update Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
