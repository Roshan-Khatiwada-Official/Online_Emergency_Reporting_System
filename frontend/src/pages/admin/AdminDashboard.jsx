import { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import { api } from "../../api/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const CATEGORY_COLORS = ["#dc143c", "#003893", "#1a9e5c", "#f5a524", "#7c3aed", "#0ea5e9", "#e11d48", "#0891b2", "#65a30d", "#94a3b8"];

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/admin")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <Spinner page />
      </DashboardLayout>
    );
  }

  const lineData = {
    labels: data.reportsOverview.map((r) => monthLabel(r.month)),
    datasets: [
      {
        label: "Reports",
        data: data.reportsOverview.map((r) => r.count),
        borderColor: "#003893",
        backgroundColor: "rgba(0,56,147,0.12)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#003893"
      }
    ]
  };

  const donutData = {
    labels: data.categoryCounts.map((c) => c.name),
    datasets: [
      {
        data: data.categoryCounts.map((c) => c.count),
        backgroundColor: CATEGORY_COLORS,
        borderWidth: 0
      }
    ]
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="page-header">
        <div>
          <h2>🛡️ System Overview</h2>
          <p>Nationwide crime reporting statistics and system health.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="🧑" value={data.totalUsers} label="Registered Citizens" accent="green" />
        <StatCard icon="👮" value={data.totalPolice} label="Police Officers" accent="blue" />
        <StatCard icon="🗂️" value={data.totalReports} label="Total Reports" accent="navy" />
        <StatCard icon="📈" value={`${data.solvedRate}%`} label="Solved Rate" accent="red" />
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h3 className="section-title">📊 Reports Overview (Monthly)</h3>
          <div style={{ height: 260 }}>
            {data.reportsOverview.length ? <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <div className="empty-state">No data yet.</div>}
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="section-title">🍩 Top Crime Categories</h3>
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data.categoryCounts.length ? (
              <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { boxWidth: 10, font: { size: 11 } } } } }} />
            ) : (
              <div className="empty-state">No data yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <h3 className="section-title">📍 Reports by District</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>District</th>
                <th>Total</th>
                <th>High</th>
                <th>Medium</th>
                <th>Low</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.districtCounts).map(([d, c]) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>{c.total}</td>
                  <td>{c.high || 0}</td>
                  <td>{c.medium || 0}</td>
                  <td>{c.low || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
