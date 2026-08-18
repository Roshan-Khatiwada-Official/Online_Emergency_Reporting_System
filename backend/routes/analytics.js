const express = require("express");
const { readDB } = require("../utils/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/analytics/citizen  (own report stats)
router.get("/citizen", authenticate, authorize("citizen"), (req, res) => {
  const mine = readDB("reports").filter((r) => r.userId === req.user.id);
  res.json({
    total: mine.length,
    inProgress: mine.filter((r) => ["Submitted", "Accepted", "In Progress"].includes(r.status)).length,
    solved: mine.filter((r) => r.status === "Solved").length,
    rejected: mine.filter((r) => r.status === "Rejected").length
  });
});

// GET /api/analytics/police  (assigned case stats)
router.get("/police", authenticate, authorize("police"), (req, res) => {
  const assigned = readDB("reports").filter((r) => r.assignedOfficerId === req.user.id);
  res.json({
    assigned: assigned.length,
    inProgress: assigned.filter((r) => r.status === "In Progress").length,
    solved: assigned.filter((r) => r.status === "Solved").length,
    accepted: assigned.filter((r) => r.status === "Accepted").length
  });
});

// GET /api/analytics/admin  (system-wide dashboard)
router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  const users = readDB("users");
  const reports = readDB("reports");
  const categories = readDB("crimeCategories");

  const totalUsers = users.filter((u) => u.role === "citizen").length;
  const totalPolice = users.filter((u) => u.role === "police").length;
  const totalReports = reports.length;
  const solved = reports.filter((r) => r.status === "Solved").length;
  const pending = reports.filter((r) => !["Solved", "Rejected", "Closed"].includes(r.status)).length;
  const solvedRate = totalReports ? Math.round((solved / totalReports) * 100) : 0;

  const monthly = {};
  reports.forEach((r) => {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });
  const reportsOverview = Object.entries(monthly)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({ month, count }));

  const categoryCounts = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: reports.filter((r) => r.crimeCategoryId === c.id).length
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const districtCounts = {};
  reports.forEach((r) => {
    const d = r.location.district || "Unknown";
    if (!districtCounts[d]) districtCounts[d] = { total: 0, high: 0, medium: 0, low: 0 };
    districtCounts[d].total += 1;
    districtCounts[d][r.severity.toLowerCase()] = (districtCounts[d][r.severity.toLowerCase()] || 0) + 1;
  });

  res.json({
    totalUsers,
    totalPolice,
    totalReports,
    solved,
    pending,
    solvedRate,
    reportsOverview,
    categoryCounts,
    districtCounts
  });
});

module.exports = router;
