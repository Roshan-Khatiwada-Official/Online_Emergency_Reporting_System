const express = require("express");
const { readDB } = require("../utils/db");

const router = express.Router();

// Public reference/lookup collections (needed on the registration form before login too).
router.get("/districts", (req, res) => res.json({ provinces: readDB("districts") }));
router.get("/categories", (req, res) => res.json({ categories: readDB("crimeCategories") }));
router.get("/stations", (req, res) => res.json({ stations: readDB("policeStations") }));

module.exports = router;
