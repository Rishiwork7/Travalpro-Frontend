const express = require("express");
const router = express.Router();
const {
  createLead,
  getAllLeads,
  clearAllLeads,
  deleteLead,
} = require("../controllers/leadController");
const { validateRequest } = require("../middleware/validateRequest");
const { createLeadValidator } = require("../validators/leadValidator");
const { authenticateAdmin } = require("../middleware/auth");

// Log all requests hitting this router
router.use((req, res, next) => {
  const bodyKeys = req.body ? Object.keys(req.body) : "No Body";
  console.log(`[LEAD ROUTER HIT] ${req.method} ${req.url} | Body keys: ${bodyKeys}`);
  next();
});

// Create Lead (Public)
router.post("/", createLeadValidator, validateRequest, createLead);

// Get All Leads (Protected)
router.get("/", authenticateAdmin, getAllLeads);

// Delete All Leads (Protected)
router.delete("/clear-all", authenticateAdmin, clearAllLeads);

// Delete Single Lead (Protected)
router.delete("/:id", authenticateAdmin, deleteLead);

module.exports = router;
