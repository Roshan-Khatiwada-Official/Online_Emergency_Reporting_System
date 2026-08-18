const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function toPublicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register  (citizens self-register; police/admin created by admin)
router.post("/register", (req, res) => {
  const { name, email, phone, password, address, province, district } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Name, email, phone and password are required." });
  }

  const users = readDB("users");
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const newUser = {
    id: `u-${uuidv4()}`,
    name,
    email,
    phone,
    password: bcrypt.hashSync(password, 10),
    role: "citizen",
    address: address || "",
    province: province || "",
    district: district || "",
    avatar: "",
    status: "active",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeDB("users", users);

  const token = signToken(newUser);
  res.status(201).json({ token, user: toPublicUser(newUser) });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const users = readDB("users");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: "Invalid email or password." });
  if (user.status === "suspended") return res.status(403).json({ message: "This account has been suspended." });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid email or password." });

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const users = readDB("users");
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: toPublicUser(user) });
});

// PUT /api/auth/profile
router.put("/profile", authenticate, (req, res) => {
  const users = readDB("users");
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: "User not found." });

  const { name, phone, address, province, district } = req.body;
  users[idx] = {
    ...users[idx],
    name: name ?? users[idx].name,
    phone: phone ?? users[idx].phone,
    address: address ?? users[idx].address,
    province: province ?? users[idx].province,
    district: district ?? users[idx].district
  };
  writeDB("users", users);
  res.json({ user: toPublicUser(users[idx]) });
});

// PUT /api/auth/change-password
router.put("/change-password", authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." });
  }
  const users = readDB("users");
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: "User not found." });

  if (!bcrypt.compareSync(currentPassword, users[idx].password)) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }
  users[idx].password = bcrypt.hashSync(newPassword, 10);
  writeDB("users", users);
  res.json({ message: "Password updated successfully." });
});

module.exports = router;
