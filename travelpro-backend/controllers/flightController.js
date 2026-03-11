const { searchFlights } = require("../services/amadeusService");
const { generateMockData } = require("../services/mockService");

exports.searchFlights = async (req, res, next) => {
    try {
        const { from, to, date } = req.body;

        if (!from || !to || !date) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const flights = await searchFlights(from, to, date);

        res.json(flights);
    } catch (error) {
        console.warn("⚠️ Amadeus Flight API failed or Rate Limited (Switching to Simulation):", error.message);

        // Fallback to Mock Data
        const { from, to } = req.body;
        const mockFlights = generateMockData("flights", from, to);
        res.json(mockFlights);
    }
};
