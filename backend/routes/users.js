const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

function toPublicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// GET /api/users  (admin: list all; supports ?role=)
router.get("/", authenticate, authorize("admin"), (req, res) => {
  let users = readDB("users");
  if (req.query.role) users = users.filter((u) => u.role === req.query.role);
  res.json({ users: users.map(toPublicUser) });
});

// GET /api/users/officers  (admin + police can view officer directory, e.g. for assignment)
router.get("/officers", authenticate, authorize("admin", "police"), (req, res) => {
  const users = readDB("users").filter((u) => u.role === "police");
  res.json({ officers: users.map(toPublicUser) });
});

// POST /api/users  (admin creates a police officer or another admin)
router.post("/", authenticate, authorize("admin"), (req, res) => {
  const { name, email, phone, password, role, badgeNumber, rank, stationId, address, province, district } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password and role are required." });
  }
  if (!["police", "admin", "citizen"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  const users = readDB("users");
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const newUser = {
    id: `u-${uuidv4()}`,
    name,
    email,
    phone: phone || "",
    password: bcrypt.hashSync(password, 10),
    role,
    address: address || "",
    province: province || "",
    district: district || "",
    avatar: "",
    status: "active",
    createdAt: new Date().toISOString(),
    ...(role === "police" ? { badgeNumber: badgeNumber || "", rank: rank || "Constable", stationId: stationId ? Number(stationId) : null } : {})
  };

  users.push(newUser);
  writeDB("users", users);
  res.status(201).json({ user: toPublicUser(newUser) });
});

// PUT /api/users/:id  (admin edits any user)
router.put("/:id", authenticate, authorize("admin"), (req, res) => {
  const users = readDB("users");
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "User not found." });

  const { name, phone, address, province, district, status, role, badgeNumber, rank, stationId } = req.body;
  users[idx] = {
    ...users[idx],
    name: name ?? users[idx].name,
    phone: phone ?? users[idx].phone,
    address: address ?? users[idx].address,
    province: province ?? users[idx].province,
    district: district ?? users[idx].district,
    status: status ?? users[idx].status,
    role: role ?? users[idx].role,
    ...(role === "police" || users[idx].role === "police"
      ? {
          badgeNumber: badgeNumber ?? users[idx].badgeNumber,
          rank: rank ?? users[idx].rank,
          stationId: stationId !== undefined ? Number(stationId) : users[idx].stationId
        }
      : {})
  };
  writeDB("users", users);
  res.json({ user: toPublicUser(users[idx]) });
});

// DELETE /api/users/:id  (admin removes a user)
router.delete("/:id", authenticate, authorize("admin"), (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
  const users = readDB("users");
  const filtered = users.filter((u) => u.id !== req.params.id);
  if (filtered.length === users.length) return res.status(404).json({ message: "User not found." });
  writeDB("users", filtered);
  res.json({ message: "User deleted." });
});

module.exports = router;
