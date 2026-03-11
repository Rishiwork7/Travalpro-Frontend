const axios = require("axios");

/* ==============================
   GLOBALS
============================== */

let accessToken = null;
let tokenExpiry = null;

const API_TIMEOUT = 25000;

const internalCache = new Map();

const CACHE_TTL = {
  CITY_RESOLVE: 24 * 60 * 60 * 1000,
  HOTEL_LIST: 6 * 60 * 60 * 1000,
};

/* ==============================
   CACHE HELPERS
============================== */

const getFromCache = (key) => {
  const entry = internalCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    internalCache.delete(key);
    return null;
  }

  return entry.data;
};

const setToCache = (key, data, ttl) => {
  internalCache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
};

/* ==============================
   ACCESS TOKEN
============================== */

const getAccessToken = async () => {
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: API_TIMEOUT,
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000;

  return accessToken;
};

/* ==============================
   UTILS
============================== */

const normalize = (val) =>
  val?.includes("-") ? val.split("-")[0].trim() : val?.trim();

const isIata = (val) => /^[A-Za-z]{3}$/.test(val || "");

const addDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const convertToRaw = (amount) =>
  Math.round(Number(amount || 0));

/* ==============================
   CITY MAP (FAST PATH)
============================== */

const cityCodeMap = require("./data/popularCities");

const popularCities = Object.entries(cityCodeMap).map(([name, code]) => ({
  name: name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  iataCode: code,
  country: "Unknown"
}));

/* ==============================
   LOCATION RESOLVE
============================== */

const resolveLocationCode = (keyword) => {
  const clean = normalize(keyword);
  if (!clean) throw new Error("Invalid location");

  const mapped = cityCodeMap[clean.toLowerCase()];
  if (!mapped) {
    throw new Error("City not supported yet");
  }

  return mapped;
};

/* ==============================
   FLIGHT SEARCH
============================== */

const searchFlights = async (from, to, date) => {
  const token = await getAccessToken();

  from = normalize(from)?.substring(0, 3)?.toUpperCase();
  to = normalize(to)?.substring(0, 3)?.toUpperCase();

  const response = await axios.get(
    "https://test.api.amadeus.com/v2/shopping/flight-offers",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate: date,
        adults: 1,
        max: 20,
        currencyCode: "USD",
      },
      timeout: API_TIMEOUT,
    }
  );

  return (response.data?.data || []).map((flight) => {
    const itinerary = flight.itineraries[0];
    const segments = itinerary.segments;
    const first = segments[0];
    const last = segments[segments.length - 1];

    return {
      id: flight.id,
      airlineCode: first.carrierCode,
      flightNumber: `${first.carrierCode} ${first.number}`,
      from: first.departure.iataCode,
      to: last.arrival.iataCode,
      departure: first.departure.at.split("T")[1].slice(0, 5),
      arrival: last.arrival.at.split("T")[1].slice(0, 5),
      duration: itinerary.duration.replace("PT", "").toLowerCase(),
      stops: segments.length - 1,
      price: convertToRaw(flight.price.total),
      currency: flight.price.currency,
    };
  });
};

/* ==============================
   HOTEL SEARCH
============================== */

const searchHotels = async (
  city,
  checkInDate,
  checkOutDate,
  roomQuantity = 1
) => {
  console.time("HOTEL_TOTAL");
  console.log(`[Hotel Search] City: ${city}, CheckIn: ${checkInDate}, CheckOut: ${checkOutDate}, Rooms: ${roomQuantity}`);

  const token = await getAccessToken();
  const cityCode = await resolveLocationCode(city, "CITY");
  console.log(`[Hotel Search] Resolved City Code: ${cityCode}`);

  const outboundDate =
    checkOutDate || addDays(checkInDate, 1);

  const hotelListKey = `hotel_list_${cityCode}`;
  let hotelIds = getFromCache(hotelListKey);

  if (!hotelIds) {
    const listResponse = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { cityCode },
        timeout: API_TIMEOUT,
      }
    );

    hotelIds = (listResponse.data?.data || [])
      .slice(0, 5)
      .map((h) => h.hotelId)
      .filter(Boolean);

    setToCache(hotelListKey, hotelIds, CACHE_TTL.HOTEL_LIST);
  }

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
        roomQuantity: String(roomQuantity),
        currency: "USD",
      },
      timeout: API_TIMEOUT,
    }
  );

  console.timeEnd("HOTEL_TOTAL");

  return (offersResponse.data?.data || []).map((hotel) => {
    const offer = hotel.offers?.[0] || {};
    const price = offer.price?.total;
    const currency = offer.price?.currency;

    return {
      id: offer.id || hotel.hotel?.hotelId,
      type: "hotels",
      title: hotel.hotel?.name,
      subtitle:
        hotel.hotel?.address?.lines?.join(", ") ||
        hotel.hotel?.cityCode,
      rating: hotel.hotel?.rating,
      price: convertToRaw(price),
      currency,
      image: hotel.hotel?.media?.[0]?.uri,
    };
  });
};

/* ==============================
   TRANSFERS (PARALLEL FIX)
============================== */

const searchTransfers = async (from, to, date) => {
  const token = await getAccessToken();

  const [startCode, endCode] = await Promise.all([
    resolveLocationCode(from, "AIRPORT"),
    resolveLocationCode(to, "AIRPORT"),
  ]);

  const response = await axios.post(
    "https://test.api.amadeus.com/v1/shopping/transfer-offers",
    {
      startLocationCode: startCode,
      endLocationCode: endCode,
      transferType: "PRIVATE",
      passengers: 1,
      startDateTime: `${date}T09:00:00`,
      currency: "USD",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: API_TIMEOUT,
    }
  );

  return (response.data?.data || []).map((offer, i) => ({
    id: offer.id || `transfer_${i}`,
    type: "car_rental",
    operatorName: offer.serviceProvider?.name,
    title: offer.vehicle?.description || "Private Transfer",
    subtitle: `${startCode} → ${endCode}`,
    price: convertToRaw(offer.price?.total),
    currency: offer.price?.currency,
  }));
};

/* ==============================
   CITY SEARCH (AUTOCOMPLETE)
============================== */


const searchHotelCitiesService = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];

  const lowerKeyword = keyword.toLowerCase();

  // 🔥 Step 1: Local Fast Search
  const localResults = popularCities.filter(city =>
    city.name.toLowerCase().includes(lowerKeyword)
  );

  return localResults.slice(0, 8).map(city => ({
    name: city.name,
    label: `${city.name} (${city.iataCode})`,
    iataCode: city.iataCode,
    country: city.country,
  }));
};



module.exports = {
  getAccessToken,
  searchFlights,
  searchHotels,
  searchTransfers,
  searchHotelCitiesService,
};