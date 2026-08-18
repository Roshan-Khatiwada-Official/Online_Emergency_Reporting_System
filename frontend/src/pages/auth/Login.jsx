import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Crest from "../../components/Crest";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from || `/${user.role}`;
      navigate(dest, { replace: true });
      showToast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
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
        <h1>Welcome Back</h1>
        <p className="np">सुरक्षित नेपाल, समृद्ध नेपाल</p>
        <p className="tagline">
          Login to report crimes, track your cases, or manage investigations — securely, smartly and transparently.
        </p>
        <div className="feature-pills">
          <span>🗺️ Live Crime Map</span>
          <span>🔔 Real-time Alerts</span>
          <span>🎫 Case Tracking</span>
          <span>🚨 Emergency SOS</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Login to NCRS</h2>
          <p className="subtitle">Enter your credentials to access your dashboard</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Phone</label>
              <input
                type="text"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
