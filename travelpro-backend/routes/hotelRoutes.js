const express = require("express");
const router = express.Router();
const { getHotels } = require("../controllers/hotelController");
const { searchHotelCities } = require("../controllers/hotelController");

// GET /api/hotels/search
router.get("/search", getHotels);
router.get("/cities", searchHotelCities);

module.exports = router;
