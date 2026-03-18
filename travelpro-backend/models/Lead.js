const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      minlength: [7, "Phone number must be at least 7 characters"],
    },
    service: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
    },
    flightId: {
      type: String,
      trim: true,
    },
    primaryContact: {
      type: Object,
    },
    passengers: {
      type: [Object],
      default: [],
    },
    totalAmount: {
      type: Number,
      min: [0, "Total amount cannot be negative"],
    },
    bookingDetails: {
      type: Object,
    },
    status: {
      type: String,
      enum: {
        values: ["new", "contacted", "converted", "rejected"],
        message: "{VALUE} is not a supported status",
      },
      default: "new",
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes
LeadSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Lead", LeadSchema);
