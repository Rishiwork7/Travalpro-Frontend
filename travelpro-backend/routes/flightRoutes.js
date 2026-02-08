const express = require("express");
const router = express.Router();
const { searchFlights } = require("../services/amadeusService");

router.post("/search", async (req, res) => {
  try {
    const { from, to, date } = req.body;

    if (!from || !to || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const flights = await searchFlights(from, to, date);

    res.json(flights);
  } catch (error) {
    console.error("FLIGHT ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
