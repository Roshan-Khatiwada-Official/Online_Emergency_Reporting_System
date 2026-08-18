const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../utils/upload");

const router = express.Router();

const VALID_STATUSES = ["Submitted", "Accepted", "In Progress", "Solved", "Rejected", "Closed"];

function nextCaseId() {
  const reports = readDB("reports");
  const year = new Date().getFullYear();
  const seq = reports.length ? Math.max(...reports.map((r) => parseInt(r.caseId.split("-").pop(), 10) || 0)) + 1 : 1001;
  return `CR-${year}-${seq}`;
}

function addHistory(reportId, status, note, actor) {
  const history = readDB("caseHistory");
  history.push({
    id: `h-${uuidv4()}`,
    reportId,
    status,
    note,
    actorId: actor.id,
    actorRole: actor.role,
    createdAt: new Date().toISOString()
  });
  writeDB("caseHistory", history);
}

function notify(userId, title, message, relatedReportId) {
  const notifications = readDB("notifications");
  notifications.push({
    id: `n-${uuidv4()}`,
    userId,
    title,
    message,
    isRead: false,
    relatedReportId,
    createdAt: new Date().toISOString()
  });
  writeDB("notifications", notifications);
}

function enrich(report) {
  const users = readDB("users");
  const categories = readDB("crimeCategories");
  const stations = readDB("policeStations");
  const reporter = users.find((u) => u.id === report.userId);
  const officer = users.find((u) => u.id === report.assignedOfficerId);
  const category = categories.find((c) => c.id === report.crimeCategoryId);
  const station = stations.find((s) => s.id === report.stationId);
  return {
    ...report,
    reporterName: reporter ? reporter.name : "Unknown",
    reporterPhone: reporter ? reporter.phone : "",
    officerName: officer ? officer.name : null,
    categoryName: category ? category.name : "Others",
    categoryIcon: category ? category.icon : "📋",
    stationName: station ? station.name : "Unassigned"
  };
}

// GET /api/reports  (role-scoped list with filters)
router.get("/", authenticate, (req, res) => {
  let reports = readDB("reports");
  const { status, category, district, search, mine } = req.query;

  if (req.user.role === "citizen") {
    reports = reports.filter((r) => r.userId === req.user.id);
  } else if (req.user.role === "police") {
    if (mine === "true") {
      reports = reports.filter((r) => r.assignedOfficerId === req.user.id);
    }
  }

  if (status) reports = reports.filter((r) => r.status === status);
  if (category) reports = reports.filter((r) => String(r.crimeCategoryId) === String(category));
  if (district) reports = reports.filter((r) => r.location.district === district);
  if (search) {
    const q = search.toLowerCase();
    reports = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.caseId.toLowerCase().includes(q) ||
        r.location.address.toLowerCase().includes(q)
    );
  }

  reports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reports: reports.map(enrich) });
});

// GET /api/reports/map  (public-ish, all reports for the crime map — auth required, any role)
router.get("/map", authenticate, (req, res) => {
  const reports = readDB("reports");
  res.json({
    reports: reports.map((r) => ({
      id: r.id,
      caseId: r.caseId,
      title: r.title,
      severity: r.severity,
      status: r.status,
      location: r.location,
      createdAt: r.createdAt
    }))
  });
});

// GET /api/reports/:id
router.get("/:id", authenticate, (req, res) => {
  const reports = readDB("reports");
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found." });

  if (req.user.role === "citizen" && report.userId !== req.user.id) {
    return res.status(403).json({ message: "You cannot view this report." });
  }

  const history = readDB("caseHistory")
    .filter((h) => h.reportId === report.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json({ report: enrich(report), history });
});

// POST /api/reports  (citizen creates a report, with optional evidence files)
router.post("/", authenticate, authorize("citizen"), upload.array("evidence", 5), (req, res) => {
  const { title, description, crimeCategoryId, address, province, district, lat, lng, severity, isSOS } = req.body;

  if (!title || !description || !crimeCategoryId || !address) {
    return res.status(400).json({ message: "Title, description, category and location address are required." });
  }

  const stations = readDB("policeStations");
  const nearestStation =
    stations.find((s) => s.district === district) || stations[0] || null;

  const evidence = (req.files || []).map((f) => ({
    id: `e-${uuidv4()}`,
    type: f.mimetype,
    filename: f.filename,
    originalName: f.originalname,
    url: `/uploads/${f.filename}`
  }));

  const report = {
    id: `r-${uuidv4()}`,
    caseId: nextCaseId(),
    userId: req.user.id,
    crimeCategoryId: Number(crimeCategoryId),
    title,
    description,
    location: {
      address,
      province: province || "",
      district: district || "",
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null
    },
    severity: severity || "Medium",
    status: "Submitted",
    evidence,
    assignedOfficerId: null,
    stationId: nearestStation ? nearestStation.id : null,
    isSOS: isSOS === "true" || isSOS === true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const reports = readDB("reports");
  reports.push(report);
  writeDB("reports", reports);

  addHistory(report.id, "Submitted", "Report submitted by citizen.", req.user);

  const admins = readDB("users").filter((u) => u.role === "admin");
  admins.forEach((a) =>
    notify(a.id, report.isSOS ? "🚨 New SOS Report" : "New Crime Report", `${report.title} (${report.caseId}) submitted.`, report.id)
  );

  res.status(201).json({ report: enrich(report) });
});

// POST /api/reports/sos  (one-tap emergency SOS)
router.post("/sos", authenticate, authorize("citizen"), (req, res) => {
  const { lat, lng, address } = req.body;
  const stations = readDB("policeStations");
  const nearestStation = stations[0] || null;

  const report = {
    id: `r-${uuidv4()}`,
    caseId: nextCaseId(),
    userId: req.user.id,
    crimeCategoryId: 10,
    title: "Emergency SOS Alert",
    description: "Emergency SOS triggered by citizen. Immediate assistance required.",
    location: {
      address: address || "Location shared via SOS",
      province: "",
      district: "",
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null
    },
    severity: "High",
    status: "Submitted",
    evidence: [],
    assignedOfficerId: null,
    stationId: nearestStation ? nearestStation.id : null,
    isSOS: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const reports = readDB("reports");
  reports.push(report);
  writeDB("reports", reports);
  addHistory(report.id, "Submitted", "🚨 SOS alert triggered by citizen.", req.user);

  const admins = readDB("users").filter((u) => u.role === "admin" || u.role === "police");
  admins.forEach((a) => notify(a.id, "🚨 SOS ALERT", `Emergency SOS from a citizen at ${report.location.address}.`, report.id));

  res.status(201).json({ report: enrich(report) });
});

// PUT /api/reports/:id/status  (police/admin update status)
router.put("/:id/status", authenticate, authorize("police", "admin"), (req, res) => {
  const { status, note } = req.body;
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const reports = readDB("reports");
  const idx = reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Report not found." });

  if (req.user.role === "police" && reports[idx].assignedOfficerId !== req.user.id) {
    return res.status(403).json({ message: "You are not assigned to this case." });
  }

  reports[idx].status = status;
  reports[idx].updatedAt = new Date().toISOString();
  writeDB("reports", reports);

  addHistory(reports[idx].id, status, note || `Status updated to ${status}.`, req.user);
  notify(reports[idx].userId, "Case Status Updated", `Your report ${reports[idx].caseId} is now "${status}".`, reports[idx].id);

  res.json({ report: enrich(reports[idx]) });
});

// PUT /api/reports/:id/assign  (admin assigns officer/station)
router.put("/:id/assign", authenticate, authorize("admin"), (req, res) => {
  const { officerId, stationId } = req.body;
  const reports = readDB("reports");
  const idx = reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Report not found." });

  reports[idx].assignedOfficerId = officerId || null;
  if (stationId) reports[idx].stationId = Number(stationId);
  if (reports[idx].status === "Submitted") reports[idx].status = "Accepted";
  reports[idx].updatedAt = new Date().toISOString();
  writeDB("reports", reports);

  const officer = readDB("users").find((u) => u.id === officerId);
  addHistory(reports[idx].id, "Accepted", `Assigned to ${officer ? officer.name : "an officer"}.`, req.user);
  notify(reports[idx].userId, "Report Accepted", `Your report ${reports[idx].caseId} has been accepted and assigned.`, reports[idx].id);
  if (officer) notify(officer.id, "New Case Assigned", `You have been assigned case ${reports[idx].caseId}.`, reports[idx].id);

  res.json({ report: enrich(reports[idx]) });
});

module.exports = router;
