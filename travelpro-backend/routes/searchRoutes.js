const express = require("express");
const router = express.Router();
const { searchService, searchHotelCities } = require("../controllers/searchController");
const rateLimit = require("express-rate-limit");

// Rate Limiting for Search
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 search requests per minute
    message: {
        success: false,
        message: "Too many search requests, please try again later.",
    },
});

// POST /api/search/:service
router.post("/:service", searchLimiter, searchService);

// GET /api/search/hotel-cities
router.get("/hotel-cities", searchHotelCities);

module.exports = router;
