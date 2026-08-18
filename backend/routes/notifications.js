const express = require("express");
const { readDB, writeDB } = require("../utils/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications  (current user's notifications)
router.get("/", authenticate, (req, res) => {
  const notifications = readDB("notifications")
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
});

// PUT /api/notifications/:id/read
router.put("/:id/read", authenticate, (req, res) => {
  const notifications = readDB("notifications");
  const idx = notifications.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: "Notification not found." });
  notifications[idx].isRead = true;
  writeDB("notifications", notifications);
  res.json({ notification: notifications[idx] });
});

// PUT /api/notifications/read-all
router.put("/read-all", authenticate, (req, res) => {
  const notifications = readDB("notifications");
  notifications.forEach((n) => {
    if (n.userId === req.user.id) n.isRead = true;
  });
  writeDB("notifications", notifications);
  res.json({ message: "All notifications marked as read." });
});

module.exports = router;
