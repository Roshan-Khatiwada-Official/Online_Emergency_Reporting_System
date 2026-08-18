import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

export default function ReportCrime() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    crimeCategoryId: "",
    description: "",
    province: "",
    district: "",
    address: "",
    severity: "Medium",
    lat: "",
    lng: ""
  });

  useEffect(() => {
    Promise.all([api.get("/meta/categories"), api.get("/meta/districts")]).then(([c, d]) => {
      setCategories(c.categories);
      setProvinces(d.provinces);
    });
  }, []);

  const districtOptions = provinces.find((p) => p.province === form.province)?.districts || [];

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
      () => setError("Could not fetch your location. Please allow location access.")
    );
  }

  function handleFiles(e) {
    setFiles(Array.from(e.target.files).slice(0, 5));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.crimeCategoryId || !form.description || !form.address) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("evidence", f));

      const data = await api.post("/reports", fd, { isForm: true });
      setSuccess(`Report submitted successfully — Case ID: ${data.report.caseId}`);
      showToast(`Report submitted — Case ID: ${data.report.caseId}`, "success");
      setTimeout(() => navigate(`/citizen/reports/${data.report.id}`), 1200);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Report a Crime">
      <div className="page-header">
        <div>
          <h2>📝 Report a Crime</h2>
          <p>Provide as much detail as possible to help police investigate quickly.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ maxWidth: 760 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Crime Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mobile phone stolen near Thamel" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Crime Type *</label>
              <select value={form.crimeCategoryId} onChange={(e) => setForm({ ...form, crimeCategoryId: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened, when, and any other relevant details..." />
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
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} disabled={!form.province}>
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
            <label>Location / Address *</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Thamel, Kathmandu" />
          </div>

          <div className="form-group">
            <label>GPS Location (optional)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={useMyLocation}>
                📍 Use My Current Location
              </button>
              {form.lat && form.lng && (
                <span className="field-hint">
                  Lat {form.lat}, Lng {form.lng}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Upload Evidence (photos, videos, PDF — up to 5 files)</label>
            <label className="file-drop">
              <input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleFiles} style={{ display: "none" }} />
              📎 Click to select files or drag & drop
            </label>
            {files.length > 0 && (
              <div className="evidence-thumbs">
                {files.map((f, i) => (
                  <div className="thumb" key={i} title={f.name}>
                    {f.type.startsWith("image") ? <img src={URL.createObjectURL(f)} alt={f.name} /> : "📄"}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
