const { body } = require("express-validator");

exports.searchFlightValidator = [
  body("from")
    .notEmpty().withMessage("Origin is required")
    .trim()
    .custom((value) => {
      // Accept either "DEL" or "DEL - Delhi" format
      const code = value.includes("-") ? value.split("-")[0].trim() : value;
      if (!/^[A-Za-z]{3}$/.test(code)) {
        throw new Error("Origin must contain a valid 3-letter IATA code");
      }
      return true;
    }),

  body("to")
    .notEmpty().withMessage("Destination is required")
    .trim()
    .custom((value, { req }) => {
      // Accept either "DEL" or "DEL - Delhi" format
      const code = value.includes("-") ? value.split("-")[0].trim() : value;
      if (!/^[A-Za-z]{3}$/.test(code)) {
        throw new Error("Destination must contain a valid 3-letter IATA code");
      }
      
      // Check if origin and destination are same
      const fromCode = req.body.from.includes("-") 
        ? req.body.from.split("-")[0].trim() 
        : req.body.from;
      if (code.toUpperCase() === fromCode.toUpperCase()) {
        throw new Error("Origin and destination cannot be same");
      }
      return true;
    }),

  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be in YYYY-MM-DD format")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (inputDate < today) {
        throw new Error("Date cannot be in the past");
      }
      return true;
    }),
];
