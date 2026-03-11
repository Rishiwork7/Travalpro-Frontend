require("dotenv").config();
const axios = require("axios");

const getAccessToken = async () => {
    try {
        const response = await axios.post(
            "https://test.api.amadeus.com/v1/security/oauth2/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.AMADEUS_API_KEY,
                client_secret: process.env.AMADEUS_API_SECRET,
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Token Error:", error.response?.data || error.message);
        process.exit(1);
    }
};

const testHotelSearch = async () => {
    const token = await getAccessToken();
    const cityCode = "PAR"; // Testing PAR

    console.log(`Testing hotel search for cityCode: ${cityCode}`);

    try {
        const response = await axios.get(
            "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { cityCode, radius: 10, radiusUnit: "KM" },
            }
        );
        console.log("Success! Found hotels:", response.data.data.length);
    } catch (error) {
        console.error("Search Error Status:", error.response?.status);
        console.error("Search Error Data:", JSON.stringify(error.response?.data, null, 2));
    }
};

testHotelSearch();
