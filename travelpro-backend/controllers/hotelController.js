const { searchHotels, searchHotelCitiesService } = require("../services/amadeusService");

const { generateMockData } = require("../services/mockService");

exports.getHotels = async (req, res, next) => {
  try {
    const { city, checkIn, checkOut, rooms } = req.query;

    if (!city || !checkIn) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hotels = await searchHotels(city, checkIn, checkOut, rooms);
    res.json(hotels);

  } catch (error) {
    next(error);
  }
};

exports.searchHotelCities = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.json([]);
    }

    const cities = await searchHotelCitiesService(keyword);

    res.json(cities);

  } catch (error) {
    next(error);
  }
};
