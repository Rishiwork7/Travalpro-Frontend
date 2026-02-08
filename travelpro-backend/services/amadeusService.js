const axios = require("axios");

let accessToken = null;
let tokenExpiry = null;

// --- 1. AIRLINE MAPPING (Logo & Name ke liye) ---
const airlineMap = {
  "AI": "Air India",
  "6E": "IndiGo",
  "UK": "Vistara",
  "QP": "Akasa Air",
  "SG": "SpiceJet",
  "IX": "Air India Express",
  "G8": "Go First",
  "H9": "Himalaya Airlines"
};

const getAccessToken = async () => {
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,    // .env variable name check kar lena
        client_secret: process.env.AMADEUS_API_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    console.error("Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Amadeus");
  }
};

const normalizeLocationInput = (value) => {
  if (!value) return "";
  if (value.includes("-")) return value.split("-")[0].trim();
  return value.trim();
};

const isLikelyIata = (value) => /^[A-Za-z]{3}$/.test(value || "");

const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const convertToINR = (amount, currency) => {
  const value = Number(amount || 0);
  if (!value) return 0;
  if (currency === "INR") return Math.round(value);
  if (currency === "EUR") return Math.round(value * 92);
  if (currency === "USD") return Math.round(value * 83);
  return Math.round(value * 92);
};

const resolveLocationCode = async (keyword, subType) => {
  const token = await getAccessToken();
  const clean = normalizeLocationInput(keyword);
  if (isLikelyIata(clean)) {
    return clean.toUpperCase();
  }

  const response = await axios.get(
    "https://test.api.amadeus.com/v1/reference-data/locations",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        keyword: clean,
        subType,
        view: "LIGHT",
        sort: "analytics.travelers.score",
      },
    }
  );

  const match = response.data?.data?.[0];
  if (!match?.iataCode) {
    throw new Error(`No ${subType} match found for ${clean}`);
  }
  return match.iataCode;
};

const searchFlights = async (from, to, date) => {
  try {
    const token = await getAccessToken();

    // --- 2. INPUT CLEANING (Jad se problem khatam) ---
    // Agar "DEL - Delhi" aaya to "DEL" banayega
    if (from && from.includes("-")) from = from.split("-")[0].trim();
    if (to && to.includes("-")) to = to.split("-")[0].trim();

    // Safety: 3 Letters & Uppercase
    from = from ? from.substring(0, 3).toUpperCase() : "";
    to = to ? to.substring(0, 3).toUpperCase() : "";

    console.log(`Service Searching: ${from} -> ${to} on ${date}`);

    const response = await axios.get(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          originLocationCode: from,
          destinationLocationCode: to,
          departureDate: date,
          adults: 1,
          max: 15, // Results badha diye (15)
        },
      }
    );

    // --- 3. DATA TRANSFORMATION (Euro -> INR, AI -> Air India) ---
    const flights = response.data.data.map((flight) => {
      const segment = flight.itineraries[0].segments[0];
      const airlineCode = segment.carrierCode;

      // Price Convert (Euro se INR approx x92)
      const priceINR = Math.round(parseFloat(flight.price.total) * 92);

      return {
        id: flight.id,
        airlineName: airlineMap[airlineCode] || airlineCode, // AI -> Air India
        airlineCode: airlineCode, // Logo ke liye zaroori hai
        flightNumber: `${airlineCode} ${segment.number}`,
        
        from: segment.departure.iataCode,
        to: segment.arrival.iataCode,
        
        departure: segment.departure.at.split("T")[1].substring(0, 5), // Sirf Time (10:00)
        arrival: segment.arrival.at.split("T")[1].substring(0, 5),   // Sirf Time (12:00)
        
        duration: flight.itineraries[0].duration.replace("PT", "").toLowerCase(),
        stops: flight.itineraries[0].segments.length - 1,
        
        price: priceINR, // Ab INR price jayega
        currency: "INR",
      };
    });

    return flights;

  } catch (error) {
    console.error("Search Error:", error.response?.data || error.message);
    throw error;
  }
};

const searchHotels = async (city, checkInDate, checkOutDate) => {
  try {
    const token = await getAccessToken();
    const cityCode = await resolveLocationCode(city, "CITY");
    const outboundDate = checkOutDate || addDays(checkInDate, 1);

    const hotelsResponse = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          cityCode,
          radius: 20,
          radiusUnit: "KM",
        },
      }
    );

    const hotelIds = (hotelsResponse.data?.data || [])
      .slice(0, 10)
      .map((hotel) => hotel.hotelId)
      .filter(Boolean);

    if (!hotelIds.length) return [];

    const offersResponse = await axios.get(
      "https://test.api.amadeus.com/v3/shopping/hotel-offers",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          hotelIds: hotelIds.join(","),
          adults: 1,
          checkInDate,
          checkOutDate: outboundDate,
          roomQuantity: 1,
        },
      }
    );

    return (offersResponse.data?.data || []).map((hotel) => {
      const offer = hotel.offers?.[0] || {};
      const price = offer.price?.total;
      const currency = offer.price?.currency;
      const roomCategory = offer.room?.typeEstimated?.category;
      const board = offer.boardType;
      const details = [roomCategory, board].filter(Boolean).join(" • ");
      const address =
        hotel.hotel?.address?.lines?.join(", ") ||
        hotel.hotel?.address?.cityName ||
        hotel.hotel?.cityCode;

      return {
        id: offer.id || hotel.hotel?.hotelId,
        type: "hotels",
        title: hotel.hotel?.name,
        subtitle: address,
        details: details || "Instant confirmation",
        rating: hotel.hotel?.rating,
        price: convertToINR(price, currency),
        currency: "INR",
        image: hotel.hotel?.media?.[0]?.uri,
      };
    });
  } catch (error) {
    console.error("Hotel Search Error:", error.response?.data || error.message);
    throw error;
  }
};

const searchTransfers = async (from, to, date) => {
  try {
    const token = await getAccessToken();
    const startCode = await resolveLocationCode(from, "AIRPORT");
    const endCode = await resolveLocationCode(to, "AIRPORT");
    const startDateTime = `${date}T09:00:00`;

    const response = await axios.post(
      "https://test.api.amadeus.com/v1/shopping/transfer-offers",
      {
        startLocationCode: startCode,
        endLocationCode: endCode,
        transferType: "PRIVATE",
        passengers: 1,
        startDateTime,
        currency: "INR",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return (response.data?.data || []).map((offer, index) => {
      const price = offer.price?.total;
      const currency = offer.price?.currency;
      const vehicle = offer.vehicle || {};
      const provider = offer.serviceProvider || {};
      const title =
        vehicle.description || vehicle.category || "Private Transfer";
      const details = [offer.transferType, vehicle.code]
        .filter(Boolean)
        .join(" • ");

      return {
        id: offer.id || `transfer_${index + 1}`,
        type: "car_rental",
        operatorName: provider.name || "Amadeus Transfer",
        title,
        subtitle: `${startCode} to ${endCode}`,
        details: details || "Private transfer",
        price: convertToINR(price, currency),
        currency: "INR",
        image:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
      };
    });
  } catch (error) {
    console.error("Transfer Search Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { searchFlights, searchHotels, searchTransfers };
