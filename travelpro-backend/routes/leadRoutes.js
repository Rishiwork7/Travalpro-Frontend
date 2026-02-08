const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// Create Lead
router.post("/", async (req, res) => {
  try {
    const {
      email,
      phone,
      service,
      bookingDetails,
      flightId,
      primaryContact,
      passengers,
      totalAmount,
    } = req.body;

    const resolvedEmail = primaryContact?.email || email;
    const resolvedPhone = primaryContact?.phone || phone;
    const hasBookingDetails = Boolean(bookingDetails || flightId || (passengers && passengers.length));

    if (!resolvedEmail || !resolvedPhone || !service || !hasBookingDetails) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lead = new Lead({
      email: resolvedEmail,
      phone: resolvedPhone,
      service,
      bookingDetails,
      flightId,
      primaryContact: primaryContact || { email: resolvedEmail, phone: resolvedPhone },
      passengers: passengers || [],
      totalAmount,
    });
    await lead.save();

    res.status(201).json({ message: "Lead Saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// Get All Leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete All Leads
router.delete("/clear-all", async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.status(200).json({ message: "All cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear" });
  }
});

// Delete Single Lead
router.delete("/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
