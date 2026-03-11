const express = require("express");
const router = express.Router();
const { searchFlights } = require("../controllers/flightController");
const { validateRequest } = require("../middleware/validateRequest");
const { searchFlightValidator } = require("../validators/flightValidator");

router.post("/search", searchFlightValidator, validateRequest, searchFlights);

module.exports = router;
