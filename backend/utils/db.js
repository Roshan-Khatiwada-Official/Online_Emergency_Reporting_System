const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "database");

function filePath(collection) {
  return path.join(DB_DIR, `${collection}.json`);
}

function readDB(collection) {
  const file = filePath(collection);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function writeDB(collection, data) {
  const file = filePath(collection);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readDB, writeDB, DB_DIR };
