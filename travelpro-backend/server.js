const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/flights", require("./routes/flightRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/airports", require("./routes/airportRoutes"));



// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("TravelPro Backend Running");
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
