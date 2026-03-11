const Lead = require("../models/Lead");

exports.createLead = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            service,
            bookingDetails,
            flightId,
            primaryContact,
            passengers,
            totalAmount,
        } = req.body;

        const resolvedEmail = primaryContact?.email || email;
        const resolvedPhone = primaryContact?.phone || phone;
        const resolvedName = primaryContact?.name || name || "Unknown"; // Defaulting to avoid hard crash if missing, but schema will validate.

        const hasBookingDetails = Boolean(
            bookingDetails || flightId || (passengers && passengers.length)
        );

        if (!resolvedEmail || !resolvedPhone || !service || !hasBookingDetails) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const lead = new Lead({
            name: resolvedName,
            email: resolvedEmail,
            phone: resolvedPhone,
            service,
            bookingDetails,
            flightId,
            primaryContact: primaryContact || {
                name: resolvedName,
                email: resolvedEmail,
                phone: resolvedPhone,
            },
            passengers: passengers || [],
            totalAmount,
        });
        await lead.save();

        res.status(201).json({ message: "Lead Saved" });
    } catch (err) {
        console.error("❌ Error Saving Lead:", err);
        next(err);
    }
};

exports.getAllLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        next(err);
    }
};

exports.clearAllLeads = async (req, res, next) => {
    try {
        await Lead.deleteMany({});
        res.status(200).json({ message: "All cleared" });
    } catch (err) {
        next(err);
    }
};

exports.deleteLead = async (req, res, next) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        next(err);
    }
};
