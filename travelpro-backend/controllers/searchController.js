const {
    searchFlights,
    searchHotels,
    searchTransfers,
    searchHotelCitiesService,
} = require("../services/amadeusService");
const { generateMockData } = require("../services/mockService");

// Simple In-Memory Cache
const searchCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

exports.searchService = async (req, res, next) => {
    try {
        const { service } = req.params;
        const filters = req.body;
        const { from, to, date } = filters;

        // 1. Create Cache Key
        const cacheKey = `${service}_${JSON.stringify(filters)}`;

        // 2. Check Cache
        if (searchCache.has(cacheKey)) {
            const cachedEntry = searchCache.get(cacheKey);
            if (Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
                // console.log(`⚡ Serving from cache: ${cacheKey}`);
                return res.json(cachedEntry.data); // Return the full cached object directly
            } else {
                searchCache.delete(cacheKey);
            }
        }

        let results = [];
        const useRealApi =
            process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET;

        // Helper to format city names
        const formatCity = (str) =>
            str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
        const origin = formatCity(from) || "Origin";
        const destination = formatCity(to) || "Destination";

        // console.log(`🔍 Searching ${service}:`, filters);

        // 3. Switch Service
        switch (service) {
            case "flights":
                if (useRealApi) {
                    try {
                        results = await searchFlights(from, to, date);
                    } catch (err) {
                        console.warn("⚠️ Amadeus Flight API failed, using mock.", err.message);
                        results = generateMockData("flights", origin, destination);
                    }
                } else {
                    results = generateMockData("flights", origin, destination);
                }
                break;

            case "hotels":
                if (useRealApi) {
                    try {
                        // Hoteliers typically search by city/destination
                        results = await searchHotels(to || from, date);
                    } catch (err) {
                        console.warn("⚠️ Amadeus Hotel API failed, using mock.", err.message);
                        results = generateMockData("hotels", origin, destination);
                    }
                } else {
                    results = generateMockData("hotels", origin, destination);
                }
                break;

            case "car_rental":
                // Using transfers API for car rentals as per previous mapping
                if (useRealApi) {
                    try {
                        results = await searchTransfers(from, to, date);
                    } catch (err) {
                        console.warn(
                            "⚠️ Amadeus Transfer API failed, using mock.",
                            err.message
                        );
                        results = generateMockData("car_rental", origin, destination);
                    }
                } else {
                    results = generateMockData("car_rental", origin, destination);
                }
                break;

            case "bus":
            case "train":
            case "packages":
            case "insurance":
            case "cruises":
                // Purely mock data for now
                results = generateMockData(service, origin, destination);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported service type: ${service}`,
                });
        }

        // 4. Store in Cache
        const responseData = {
            success: true,
            service,
            filters,
            results,
            source: "api",
        };

        searchCache.set(cacheKey, {
            timestamp: Date.now(),
            data: responseData,
        });

        // 5. Return Standard Response
        res.json(responseData);
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
        console.error("Error searching hotel cities:", error.message);
        next(error);
    }
};
