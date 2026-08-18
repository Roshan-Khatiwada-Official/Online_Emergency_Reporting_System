import { Link } from "react-router-dom";
import Crest from "../components/Crest";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "🗺️", title: "Live Crime Map", desc: "Real-time crime hotspots across Nepal" },
  { icon: "🔔", title: "Real-time Notifications", desc: "Instant updates on your case status" },
  { icon: "📢", title: "Anonymous Reporting", desc: "Report safely, identity protected" },
  { icon: "📍", title: "GPS Location Tracking", desc: "Precise incident location capture" },
  { icon: "📷", title: "Evidence Upload", desc: "Attach photos, videos & documents" },
  { icon: "🎫", title: "Case Tracking System", desc: "Follow your report from submission to resolution" },
  { icon: "🚨", title: "Emergency SOS Button", desc: "One-tap alert to the nearest police station" },
  { icon: "🔒", title: "Secure & Encrypted", desc: "Your data protected end-to-end" }
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <nav className="landing-nav">
        <div className="brand">
          <Crest size={34} />
          <span>NCRS</span>
          <img src="/images/nepal-flag.svg" alt="Flag of Nepal" className="nav-flag" />
        </div>
        <div className="nav-actions">
          {user ? (
            <Link to={`/${user.role}`} className="btn btn-primary btn-sm">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-red btn-sm">
                Report Crime
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <Crest className="crest-lg" size={96} />
        <h1>Nepal Crime Reporting System</h1>
        <p className="np-line">नेपाल अपराध रिपोर्टिङ प्रणाली</p>
        <p className="sub">
          NCRS is a unified digital platform that empowers citizens to report crimes, helps police investigate
          efficiently, and enables admins to manage the system effectively — for a safer Nepal.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-red">
            📝 Report a Crime
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
            🔑 Login
          </Link>
        </div>
      </section>

      <section className="roles-section">
        <h2>User Roles &amp; Permissions</h2>
        <div className="role-cards">
          <div className="role-card citizen">
            <div className="role-icon">🧑</div>
            <h3>Citizen</h3>
            <ul>
              <li>✔ Register / Login</li>
              <li>✔ Report Crime with GPS &amp; evidence</li>
              <li>✔ Track case status in real time</li>
              <li>✔ View notifications</li>
              <li>✔ Emergency SOS</li>
            </ul>
          </div>
          <div className="role-card police">
            <div className="role-icon">👮</div>
            <h3>Police Officer</h3>
            <ul>
              <li>✔ Accept assigned cases</li>
              <li>✔ Update investigation status</li>
              <li>✔ View evidence &amp; reporter contact</li>
              <li>✔ Track case history</li>
            </ul>
          </div>
          <div className="role-card admin">
            <div className="role-icon">🛡️</div>
            <h3>Admin</h3>
            <ul>
              <li>✔ Manage users &amp; officers</li>
              <li>✔ Assign &amp; reassign cases</li>
              <li>✔ System analytics &amp; reports</li>
              <li>✔ Manage crime categories</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="national-section">
        <div className="national-inner">
          <div className="national-visual">
            <img src="/images/boudhanath-stupa.jpg" alt="Boudhanath Stupa, Kathmandu, Nepal" />
            <div className="flag-chip">
              <img src="/images/nepal-flag.svg" alt="Flag of Nepal" />
              Nepal
            </div>
          </div>
          <div className="national-text">
            <h2>🇳🇵 Nepal National Integration</h2>
            <p>
              NCRS is built around Nepal's federal structure and public safety network, so reports route straight
              to the right local authority — anywhere from Mechi to Mahakali.
            </p>
            <div className="national-grid">
              <div className="national-item">
                <div className="ni-icon">🗺️</div>
                <div>
                  <h4>7 Provinces, 77 Districts</h4>
                  <p>Every report is tagged to its province and district for accurate routing.</p>
                </div>
              </div>
              <div className="national-item">
                <div className="ni-icon">🏢</div>
                <div>
                  <h4>Local Police Stations</h4>
                  <p>Reports are auto-matched to the nearest station in our directory.</p>
                </div>
              </div>
              <div className="national-item">
                <div className="ni-icon">🈳</div>
                <div>
                  <h4>नेपाली &amp; English</h4>
                  <p>Interface content and crime categories are available in both languages.</p>
                </div>
              </div>
              <div className="national-item">
                <div className="ni-icon">📅</div>
                <div>
                  <h4>Bikram Sambat Aware</h4>
                  <p>Dates and case timelines are readable alongside the Nepali calendar.</p>
                </div>
              </div>
            </div>
            <div className="emergency-strip">
              <span>🚓 Nepal Police — 100</span>
              <span>🚑 Ambulance — 102</span>
              <span>🚒 Fire — 101</span>
              <span>🧕 Women &amp; Children Helpline — 1145</span>
              <span>🧭 Tourist Police — 1144</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Key Features</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-tile" key={f.title}>
              <div className="fi">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-band">
        <div><strong>NCRS</strong> — Nepal Crime Reporting System</div>
        <div>सुरक्षित नागरिक, सक्षम प्रहरी, समृद्ध नेपाल — For a Safer Tomorrow</div>
        <div className="credit">
          Created by: <a href="mailto:bipinbhandari1270@gmail.com">bipinbhandari1270@gmail.com</a> · Himalaya &amp; Boudhanath photography via Wikimedia Commons (CC BY-SA 4.0)
        </div>
      </footer>
    </div>
  );
}
