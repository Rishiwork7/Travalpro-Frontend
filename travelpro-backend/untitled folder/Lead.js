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
    bookingDetails: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "New", // New | Contacted | Closed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
