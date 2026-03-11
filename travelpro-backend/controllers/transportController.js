const {
  searchFlights,
  searchHotels,
  searchTransfers,
} = require("../services/amadeusService");
const { generateMockData } = require("../services/mockService");

exports.searchTransport = async (req, res, next) => {
  const { from, to, date, type } = req.query;
  // type options: 'flights', 'hotels', 'car_rental', 'cruises', 'insurance', 'bus', 'packages', 'train'

  // Helper: Capitalize City Names (e.g. 'paris' -> 'Paris')
  const formatCity = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  const origin = formatCity(from) || "Origin";
  const destination = formatCity(to) || "Destination";

  /*
  console.log(
    `🚀 Engine Request: [${type}] from ${origin} to ${destination} on ${date}`
  );
  */

  try {
    let results = [];
    const requestId = Date.now();
    console.log(`[${requestId}] Request: ${type} | ${from} -> ${to}`);

    // ============================================
    // 1. FLIGHTS (HYBRID: REAL API + FALLBACK)
    // ============================================
    if (type === "flights" || !type) {
      // Only attempt Real API if keys exist
      if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
        try {
          results = await searchFlights(from, to, date);
        } catch (err) {
          console.warn(
            "⚠️ Amadeus Real API failed (Switching to Simulation):",
            err.code || err.message
          );
          results = generateMockData("flights", origin, destination);
        }
      } else {
        // No keys? Use Simulation immediately
        results = generateMockData("flights", origin, destination);
      }
    }

    // ============================================
    // 2. HOTELS (REAL API + FALLBACK)
    // ============================================
    else if (type === "hotels") {
      if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
        try {
          const city = to || from;
          const checkInDate = date;
          const checkOutDate = date ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;

          console.time(`[${requestId}] Hotel Search`);
          results = await searchHotels(city, checkInDate, checkOutDate);
          console.timeEnd(`[${requestId}] Hotel Search`);

        } catch (err) {
          console.warn(
            `[${requestId}] ⚠️ Amadeus Hotels API failed (Switching to Simulation):`,
            err.code || err.message
          );
          results = generateMockData("hotels", origin, destination);
        }
      } else {
        results = generateMockData("hotels", origin, destination);
      }
    }

    // ============================================
    // 3. CAR RENTAL (TRANSFER OFFERS API + FALLBACK)
    // ============================================
    else if (type === "car_rental") {
      if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
        try {
          results = await searchTransfers(from, to, date);
        } catch (err) {
          console.warn(
            "⚠️ Amadeus Transfers API failed (Switching to Simulation):",
            err.code || err.message
          );
          results = generateMockData("car_rental", origin, destination);
        }
      } else {
        results = generateMockData("car_rental", origin, destination);
      }
    }

    // ============================================
    // 4. ALL OTHER SERVICES (DYNAMIC SIMULATION)
    // ============================================
    else {
      results = generateMockData(type, origin, destination);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// --- 🧠 THE DYNAMIC SIMULATION ENGINE ---
// Generates data that looks real for ANY city input
// Moved to services/mockService.js

