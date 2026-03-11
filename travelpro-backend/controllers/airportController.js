const { fetchAirports } = require("../services/airportService");

exports.searchAirports = async (req, res, next) => {
  const query = String(req.query.q || "").trim();

  if (query.length < 1) {
    return res.json([]);
  }

  try {
    const airports = await fetchAirports(query);
    return res.json(airports);
  } catch (error) {
    next(error);
  }
};
