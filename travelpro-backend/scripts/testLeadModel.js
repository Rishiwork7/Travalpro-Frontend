const mongoose = require("mongoose");
const Lead = require("../models/Lead");
require("dotenv").config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Test 1: Invalid Email
        const invalidEmailLead = new Lead({
            name: "Test User",
            email: "invalid-email",
            phone: "1234567890",
            service: "flights",
            status: "new",
        });

        try {
            await invalidEmailLead.validate();
        } catch (err) {
            console.log("✅ Test 1 Passed: Invalid email caught:", err.errors.email.message);
        }

        // Test 2: Invalid Status
        const invalidStatusLead = new Lead({
            name: "Test User",
            email: "test@example.com",
            phone: "1234567890",
            service: "flights",
            status: "invalid_status",
        });

        try {
            await invalidStatusLead.validate();
        } catch (err) {
            console.log("✅ Test 2 Passed: Invalid status caught:", err.errors.status.message);
        }

        // Test 3: Short Phone
        const shortPhoneLead = new Lead({
            name: "Test User",
            email: "test@example.com",
            phone: "123",
            service: "flights",
            status: "new",
        });

        try {
            await shortPhoneLead.validate();
        } catch (err) {
            console.log("✅ Test 3 Passed: Short phone caught:", err.errors.phone.message);
        }

        console.log("🎉 Validation Tests Completed");
        process.exit(0);
    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
};

runTest();
