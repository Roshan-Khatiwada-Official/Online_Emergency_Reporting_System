import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Crest from "../../components/Crest";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    province: "",
    district: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/meta/districts").then((d) => setProvinces(d.provinces)).catch(() => {});
  }, []);

  const districtOptions = provinces.find((p) => p.province === form.province)?.districts || [];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      navigate(`/${user.role}`, { replace: true });
      showToast(`Welcome to NCRS, ${user.name.split(" ")[0]}!`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Crest className="crest" size={110} />
        <h1>Join NCRS</h1>
        <p className="np">सुरक्षित नागरिक, सक्षम प्रहरी</p>
        <p className="tagline">
          Create your citizen account to report crimes, upload evidence, and track investigations in real time.
        </p>
        <div className="feature-pills">
          <span>📝 Easy Reporting</span>
          <span>📍 GPS Tagging</span>
          <span>🔒 Secure &amp; Encrypted</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="subtitle">Register as a citizen to start reporting crimes</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" />
              </div>
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
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ward, Municipality" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min. 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="repeat password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
