const { body } = require("express-validator");

exports.createLeadValidator = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
    body("phone")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Phone number must be at least 10 characters"),
    body("service").notEmpty().withMessage("Service type is required"),
    body().custom((value, { req }) => {
        const { bookingDetails, flightId, passengers } = req.body;
        if (!bookingDetails && !flightId && (!passengers || passengers.length === 0)) {
            throw new Error(
                "Request must contain bookingDetails, flightId, or passengers"
            );
        }
        return true;
    }),
    body().custom((value, { req }) => {
        const { email, phone, primaryContact } = req.body;
        const resolvedEmail = primaryContact?.email || email;
        const resolvedPhone = primaryContact?.phone || phone;

        if (!resolvedEmail || !resolvedPhone) {
            throw new Error("Contact information (email and phone) is required");
        }
        return true;
    }),
];
