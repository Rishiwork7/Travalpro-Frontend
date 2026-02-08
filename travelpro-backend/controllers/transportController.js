const {
  searchFlights,
  searchHotels,
  searchTransfers,
} = require("../services/amadeusService");

exports.searchTransport = async (req, res) => {
  const { from, to, date, type } = req.query;
  // type options: 'flights', 'hotels', 'car_rental', 'cruises', 'insurance', 'bus', 'packages', 'train'

  // Helper: Capitalize City Names (e.g. 'paris' -> 'Paris')
  const formatCity = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  const origin = formatCity(from) || "Origin";
  const destination = formatCity(to) || "Destination";

  console.log(
    `🚀 Engine Request: [${type}] from ${origin} to ${destination} on ${date}`
  );

  try {
    let results = [];

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
          results = await searchHotels(to || from, date);
        } catch (err) {
          console.warn(
            "⚠️ Amadeus Hotels API failed (Switching to Simulation):",
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
    console.error("Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --- 🧠 THE DYNAMIC SIMULATION ENGINE ---
// Generates data that looks real for ANY city input
function generateMockData(type, from, to) {
  const data = [];

  // Create 6 realistic results for any service
  for (let i = 1; i <= 6; i++) {
    let item = { id: `${type}_${i}`, type: type, currency: "INR" };

    // Randomize Price slightly for realism
    const randomMultiplier = 1 + i * 0.15;

    switch (type) {
      case "hotels": {
        const brands = [
          "Grand Hyatt",
          "Marriott",
          "Radisson Blu",
          "Taj Palace",
          "The Oberoi",
          "Ibis City Center",
        ];
        item.operatorName = brands[i - 1];
        item.title = `${item.operatorName} ${to}`;
        item.subtitle =
          i % 2 === 0
            ? "City Center • 5km from Airport"
            : "Premium Area • Sea View";
        item.details = `${(4 + i * 0.1).toFixed(
          1
        )} Stars • Free WiFi • Pool`;
        item.price = Math.floor(4000 * randomMultiplier);
        item.image = `https://images.unsplash.com/photo-${
          [
            "1566073771259-6a8506099945",
            "1582719508461-905c673771fd",
            "1551882547-ff40c63fe5fa",
            "1564501049412-61c2a3083791",
            "1571003123894-1f0594d2b5d9",
            "1596394516093-501ba68a0ba6",
          ][i - 1]
        }?w=600`;
        item.rating = (4.0 + i * 0.1).toFixed(1);
        break;
      }

      case "car_rental": {
        const cars = [
          "Maruti Swift",
          "Honda City",
          "Toyota Innova",
          "Hyundai Creta",
          "BMW 3 Series",
          "Tesla Model 3",
        ];
        item.operatorName = i % 2 === 0 ? "ZoomCar" : "Avis";
        item.title = cars[i - 1];
        item.subtitle = i > 4 ? "Luxury • Automatic" : "Standard • Manual";
        item.details = `${4 + (i % 2)} Seats • GPS • Insurance Included`;
        item.price = Math.floor(1500 * randomMultiplier);
        item.image = `https://images.unsplash.com/photo-${
          [
            "1541899481282-d53bffe3c35d",
            "1549317661-bd32c8ce0db2",
            "1503376763036-066120622c74",
            "1533473359331-0135ef1b58bf",
            "1555215698-4835d8ebdaf1",
            "1560958089-b8a1929cea89",
          ][i - 1]
        }?w=600`;
        break;
      }

      case "bus":
        item.operatorName = i % 2 === 0 ? "ZingBus" : "IntrCity SmartBus";
        item.title = `${from} to ${to} Superfast`;
        item.subtitle = `Departs ${8 + i}:00 AM • Arrives ${14 + i}:00 PM`;
        item.details = "AC Sleeper • WiFi • Charging Point";
        item.price = Math.floor(800 * randomMultiplier);
        item.image =
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/FlixBus_logo.svg/1200px-FlixBus_logo.svg.png";
        break;

      case "train":
        item.operatorName = "Indian Railways";
        item.title = `${to} Shatabdi Express`;
        item.subtitle = `Departs ${6 + i}:30 AM • Arrives ${11 + i}:45 AM`;
        item.details = i % 2 === 0 ? "CC (Chair Car)" : "EC (Executive Class)";
        item.price = Math.floor(1100 * randomMultiplier);
        item.image =
          "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Railways_logo.svg/1200px-Indian_Railways_logo.svg.png";
        break;

      case "packages":
        item.operatorName = "MakeMyTrip Holidays";
        item.title = `Best of ${to} - ${3 + i} Days`;
        item.subtitle = "Flight + Hotel + Sightseeing + Meals";
        item.details = "Family Package • Breakfast Included";
        item.price = Math.floor(25000 * randomMultiplier);
        item.image =
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600";
        break;

      case "insurance":
        item.operatorName = i % 2 === 0 ? "Acko" : "Tata AIG";
        item.title = `Travel Guard: ${to} Trip`;
        item.subtitle = "Medical • Baggage • Flight Delay";
        item.details = `Coverage up to $${50000 * i}`;
        item.price = Math.floor(500 * randomMultiplier);
        item.image =
          "https://companieslogo.com/img/orig/ACKO.BO-20352438.png?t=1720244490";
        break;

      case "cruises":
        item.operatorName = "Royal Caribbean";
        item.title = `${to} & Ocean Voyage`;
        item.subtitle = `${3 + i} Nights • All Inclusive`;
        item.details = "Luxury Suite • Ocean View";
        item.price = Math.floor(35000 * randomMultiplier);
        item.image =
          "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600";
        break;

      case "flights":
        item.operatorName = i % 2 === 0 ? "Indigo" : "Air India";
        item.title = `${item.operatorName} Flight 6E-${100 + i}`;
        item.subtitle = "10:00 - 13:00";
        item.details = "Non-stop • 3h 00m";
        item.price = Math.floor(4500 * randomMultiplier);
        item.image =
          i % 2 === 0
            ? "https://images.kiwi.com/airlines/64/6E.png"
            : "https://images.kiwi.com/airlines/64/AI.png";
        break;
      default:
        break;
    }

    data.push(item);
  }
  return data;
}
