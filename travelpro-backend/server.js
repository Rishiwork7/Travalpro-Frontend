const express = require("express");
// require("express-async-errors"); // Not needed in Express 5 (native async support)
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: ["http://localhost:5173", "https://travalpro-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Body Parser with Limit
app.use(express.json({ limit: "10kb" }));

// Prevent Parameter Pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

const connectDB = require("./config/db");

// ... (Rest of imports and middleware setup remains same, handled by generic replacement if needed, but here we replace the end block)

// Routes
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/flights", require("./routes/flightRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/airports", require("./routes/airportRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));


app.use(require("./middleware/errorHandler"));

app.get("/", (req, res) => {
  res.send("TravelPro Backend Running");
});

const PORT = process.env.PORT || 5001;

// Connect to DB before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
