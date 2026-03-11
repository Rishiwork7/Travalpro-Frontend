const axios = require("axios");

const normalizeAirports = (raw) => {
    if (!Array.isArray(raw)) return [];

    const mapped = raw
        .map((item) => {
            const code =
                item.iata ||
                item.iata_code ||
                item.iataCode ||
                item.code ||
                item.airport_code;
            const city =
                item.city ||
                item.city_name ||
                item.cityName ||
                item.municipality ||
                item.location;
            const name =
                item.airport ||
                item.airport_name ||
                item.airportName ||
                item.name;

            if (!code || !name) return null;

            return {
                code: String(code).toUpperCase(),
                city: city || "",
                name,
            };
        })
        .filter(Boolean);

    const unique = new Map();
    mapped.forEach((item) => {
        unique.set(`${item.code}-${item.name}`, item);
    });

    return Array.from(unique.values()).slice(0, 10);
};

exports.fetchAirports = async (query) => {
    const baseUrl = process.env.AIRPORT_API_BASE_URL;
    const queryParam = process.env.AIRPORT_API_QUERY_PARAM || "q";

    if (!baseUrl) {
        throw new Error("Airport API not configured");
    }

    const headers = {};
    if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_HOST) {
        headers["x-rapidapi-key"] = process.env.RAPIDAPI_KEY;
        headers["x-rapidapi-host"] = process.env.RAPIDAPI_HOST;
    }

    try {
        const url = `${baseUrl}?${queryParam}=${encodeURIComponent(query)}`;
        const response = await axios.get(url, { headers });
        const payload =
            response.data?.data ||
            response.data?.airports ||
            response.data?.results ||
            response.data ||
            [];

        return normalizeAirports(payload);
    } catch (error) {
        console.error("Airport Service Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch airports");
    }
};
