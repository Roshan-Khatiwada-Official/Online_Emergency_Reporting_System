/**
 * Seeds backend/database/*.json with demo accounts and sample data.
 * Run once: `npm run seed` (safe to re-run — it overwrites the seeded files).
 */
const bcrypt = require("bcryptjs");
const { writeDB } = require("./utils/db");

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

const now = new Date().toISOString();

const users = [
  {
    id: "u-admin-1",
    name: "Roshan Khatiwada",
    email: "riteshrooson@gmail.com",
    phone: "9841000000",
    password: hash("roshan1a2b3c"),
    role: "admin",
    address: "Singha Durbar, Kathmandu",
    province: "Bagmati",
    district: "Kathmandu",
    avatar: "",
    status: "active",
    createdAt: now
  },
  {
    id: "u-police-1",
    name: "Hari Bahadur Thapa",
    email: "haribadur@gmail.com",
    phone: "9851000000",
    password: hash("hari1a2b3c"),
    role: "police",
    badgeNumber: "NP-4521",
    rank: "Inspector",
    stationId: 1,
    address: "Thamel, Kathmandu",
    province: "Bagmati",
    district: "Kathmandu",
    avatar: "",
    status: "active",
    createdAt: now
  },
  {
    id: "u-police-2",
    name: "SI Kabita Rai",
    email: "kabita.rai@ncrs.gov.np",
    phone: "9851000001",
    password: hash("Police@123"),
    role: "police",
    badgeNumber: "NP-4522",
    rank: "Sub-Inspector",
    stationId: 3,
    address: "Pulchowk, Lalitpur",
    province: "Bagmati",
    district: "Lalitpur",
    avatar: "",
    status: "active",
    createdAt: now
  },
  {
    id: "u-citizen-1",
    name: "Bipin Bhandari",
    email: "bipin@gmail.com",
    phone: "9841234567",
    password: hash("bipin1a2b3c"),
    role: "citizen",
    address: "Baneshwor, Kathmandu",
    province: "Bagmati",
    district: "Kathmandu",
    avatar: "",
    status: "active",
    createdAt: now
  },
  {
    id: "u-citizen-2",
    name: "Ramesh Gurung",
    email: "ramesh.gurung@example.com",
    phone: "9861112233",
    password: hash("Citizen@123"),
    role: "citizen",
    address: "Lakeside, Pokhara",
    province: "Gandaki",
    district: "Kaski",
    avatar: "",
    status: "active",
    createdAt: now
  }
];

const reports = [
  {
    id: "r-1052",
    caseId: "CR-2024-1052",
    userId: "u-citizen-1",
    crimeCategoryId: 1,
    title: "Theft in Baneshwor",
    description: "A mobile phone was stolen near Thamel area while walking in the evening.",
    location: { address: "Thamel, Kathmandu", province: "Bagmati", district: "Kathmandu", lat: 27.7154, lng: 85.3123 },
    severity: "High",
    status: "In Progress",
    evidence: [],
    assignedOfficerId: "u-police-1",
    stationId: 1,
    isSOS: false,
    createdAt: "2024-01-02T09:15:00.000Z",
    updatedAt: "2024-01-04T11:00:00.000Z"
  },
  {
    id: "r-1051",
    caseId: "CR-2024-1051",
    userId: "u-citizen-2",
    crimeCategoryId: 3,
    title: "Assault in Lalitpur",
    description: "Physical altercation reported near Pulchowk chowk.",
    location: { address: "Pulchowk, Lalitpur", province: "Bagmati", district: "Lalitpur", lat: 27.6766, lng: 85.3170 },
    severity: "Medium",
    status: "In Progress",
    evidence: [],
    assignedOfficerId: "u-police-2",
    stationId: 3,
    isSOS: false,
    createdAt: "2024-01-01T14:20:00.000Z",
    updatedAt: "2024-01-03T10:00:00.000Z"
  },
  {
    id: "r-1050",
    caseId: "CR-2024-1050",
    userId: "u-citizen-1",
    crimeCategoryId: 4,
    title: "Cyber Crime in Pokhara",
    description: "Bank account compromised via a phishing link sent over SMS.",
    location: { address: "Lakeside, Pokhara", province: "Gandaki", district: "Kaski", lat: 28.2096, lng: 83.9856 },
    severity: "Medium",
    status: "Submitted",
    evidence: [],
    assignedOfficerId: null,
    stationId: 5,
    isSOS: false,
    createdAt: "2024-01-01T08:05:00.000Z",
    updatedAt: "2024-01-01T08:05:00.000Z"
  },
  {
    id: "r-1049",
    caseId: "CR-2024-1049",
    userId: "u-citizen-2",
    crimeCategoryId: 2,
    title: "Robbery in Biratnagar",
    description: "Armed robbery reported at a roadside shop.",
    location: { address: "Biratnagar-4, Morang", province: "Koshi", district: "Morang", lat: 26.4525, lng: 87.2718 },
    severity: "High",
    status: "In Progress",
    evidence: [],
    assignedOfficerId: "u-police-1",
    stationId: 6,
    isSOS: false,
    createdAt: "2023-12-30T19:40:00.000Z",
    updatedAt: "2024-01-02T09:00:00.000Z"
  },
  {
    id: "r-1048",
    caseId: "CR-2024-1048",
    userId: "u-citizen-1",
    crimeCategoryId: 6,
    title: "Mobile Snatching",
    description: "Phone snatched by a passing motorbike rider.",
    location: { address: "New Baneshwor, Kathmandu", province: "Bagmati", district: "Kathmandu", lat: 27.6939, lng: 85.3436 },
    severity: "Medium",
    status: "Solved",
    evidence: [],
    assignedOfficerId: "u-police-1",
    stationId: 2,
    isSOS: false,
    createdAt: "2023-12-20T17:10:00.000Z",
    updatedAt: "2023-12-27T12:00:00.000Z"
  },
  {
    id: "r-1047",
    caseId: "CR-2024-1047",
    userId: "u-citizen-2",
    crimeCategoryId: 5,
    title: "Domestic Violence",
    description: "Domestic violence incident reported by a neighbor.",
    location: { address: "Bhaktapur Durbar Square Area, Bhaktapur", province: "Bagmati", district: "Bhaktapur", lat: 27.6710, lng: 85.4298 },
    severity: "High",
    status: "Rejected",
    evidence: [],
    assignedOfficerId: "u-police-2",
    stationId: 4,
    isSOS: false,
    createdAt: "2023-12-18T21:00:00.000Z",
    updatedAt: "2023-12-19T08:30:00.000Z"
  }
];

const caseHistory = [
  { id: "h-1", reportId: "r-1052", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-1", actorRole: "citizen", createdAt: "2024-01-02T09:15:00.000Z" },
  { id: "h-2", reportId: "r-1052", status: "Accepted", note: "Assigned to Thamel Police Station.", actorId: "u-admin-1", actorRole: "admin", createdAt: "2024-01-02T12:00:00.000Z" },
  { id: "h-3", reportId: "r-1052", status: "In Progress", note: "Investigation started by Inspector Hari Bahadur Thapa.", actorId: "u-police-1", actorRole: "police", createdAt: "2024-01-04T11:00:00.000Z" },

  { id: "h-4", reportId: "r-1051", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-2", actorRole: "citizen", createdAt: "2024-01-01T14:20:00.000Z" },
  { id: "h-5", reportId: "r-1051", status: "Accepted", note: "Assigned to Lalitpur District Police Office.", actorId: "u-admin-1", actorRole: "admin", createdAt: "2024-01-02T09:00:00.000Z" },
  { id: "h-6", reportId: "r-1051", status: "In Progress", note: "Investigation started by SI Kabita Rai.", actorId: "u-police-2", actorRole: "police", createdAt: "2024-01-03T10:00:00.000Z" },

  { id: "h-7", reportId: "r-1050", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-1", actorRole: "citizen", createdAt: "2024-01-01T08:05:00.000Z" },

  { id: "h-8", reportId: "r-1049", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-2", actorRole: "citizen", createdAt: "2023-12-30T19:40:00.000Z" },
  { id: "h-9", reportId: "r-1049", status: "Accepted", note: "Assigned to Biratnagar Police Station.", actorId: "u-admin-1", actorRole: "admin", createdAt: "2023-12-31T09:00:00.000Z" },
  { id: "h-10", reportId: "r-1049", status: "In Progress", note: "Investigation started.", actorId: "u-police-1", actorRole: "police", createdAt: "2024-01-02T09:00:00.000Z" },

  { id: "h-11", reportId: "r-1048", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-1", actorRole: "citizen", createdAt: "2023-12-20T17:10:00.000Z" },
  { id: "h-12", reportId: "r-1048", status: "Accepted", note: "Assigned to Baneshwor Police Station.", actorId: "u-admin-1", actorRole: "admin", createdAt: "2023-12-21T09:00:00.000Z" },
  { id: "h-13", reportId: "r-1048", status: "In Progress", note: "Suspect identified via CCTV footage.", actorId: "u-police-1", actorRole: "police", createdAt: "2023-12-24T15:00:00.000Z" },
  { id: "h-14", reportId: "r-1048", status: "Solved", note: "Phone recovered and returned to owner.", actorId: "u-police-1", actorRole: "police", createdAt: "2023-12-27T12:00:00.000Z" },

  { id: "h-15", reportId: "r-1047", status: "Submitted", note: "Report submitted by citizen.", actorId: "u-citizen-2", actorRole: "citizen", createdAt: "2023-12-18T21:00:00.000Z" },
  { id: "h-16", reportId: "r-1047", status: "Rejected", note: "Insufficient evidence provided; complainant advised to refile with details.", actorId: "u-police-2", actorRole: "police", createdAt: "2023-12-19T08:30:00.000Z" }
];

/**
 * Notifications are derived from caseHistory rather than hand-written, so the seeded inbox for every
 * role always matches exactly what routes/reports.js's notify() calls would have produced for the same
 * sequence of events (new report -> notify admins; assignment -> notify citizen + officer; any other
 * status change -> notify citizen). Keeping two hand-maintained copies of this is how the admin inbox
 * silently went empty last time.
 */
const adminIds = users.filter((u) => u.role === "admin").map((u) => u.id);
const reportById = Object.fromEntries(reports.map((r) => [r.id, r]));
const notifications = [];
let notifSeq = 1;

function pushNotification(userId, title, message, relatedReportId, createdAt) {
  notifications.push({
    id: `n-${notifSeq++}`,
    userId,
    title,
    message,
    isRead: false,
    relatedReportId,
    createdAt
  });
}

for (const entry of [...caseHistory].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))) {
  const report = reportById[entry.reportId];
  if (!report) continue;

  if (entry.status === "Submitted") {
    adminIds.forEach((adminId) =>
      pushNotification(adminId, report.isSOS ? "🚨 New SOS Report" : "New Crime Report", `${report.title} (${report.caseId}) submitted.`, report.id, entry.createdAt)
    );
  } else if (entry.status === "Accepted") {
    pushNotification(report.userId, "Report Accepted", `Your report ${report.caseId} has been accepted and assigned.`, report.id, entry.createdAt);
    if (report.assignedOfficerId) {
      pushNotification(report.assignedOfficerId, "New Case Assigned", `You have been assigned case ${report.caseId}.`, report.id, entry.createdAt);
    }
  } else {
    pushNotification(report.userId, "Case Status Updated", `Your report ${report.caseId} is now "${entry.status}".`, report.id, entry.createdAt);
  }
}

// Mark everything belonging to fully closed cases as read, leave active-case notifications unread —
// mirrors what a user who has already been keeping up with resolved cases would see.
notifications.forEach((n) => {
  const report = reportById[n.relatedReportId];
  n.isRead = report ? ["Solved", "Rejected", "Closed"].includes(report.status) : false;
});

writeDB("users", users);
writeDB("reports", reports);
writeDB("caseHistory", caseHistory);
writeDB("notifications", notifications);

console.log("Seed complete:");
console.log(` - ${users.length} users (riteshrooson@gmail.com / roshan1a2b3c [admin], haribadur@gmail.com / hari1a2b3c [police], bipin@gmail.com / bipin1a2b3c [citizen])`);
console.log(` - ${reports.length} reports`);
console.log(` - ${caseHistory.length} case history entries`);
console.log(` - ${notifications.length} notifications`);
