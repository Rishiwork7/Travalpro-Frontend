const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    flightId: {
      type: String,
    },
    primaryContact: {
      type: Object,
    },
    passengers: {
      type: Array,
      default: [],
    },
    totalAmount: {
      type: Number,
    },
    bookingDetails: {
      type: Object,
    },
    status: {
      type: String,
      default: "New", // New | Contacted | Closed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
