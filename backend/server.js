require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");
const metaRoutes = require("./routes/meta");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "NCRS API", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve the built frontend (frontend/dist) as one deployable app, when present.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ message: "Not found." }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`NCRS backend API running on http://localhost:${PORT}`);
});
