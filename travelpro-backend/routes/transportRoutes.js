const express = require("express");
const router = express.Router();
const { searchTransport } = require("../controllers/transportController");

router.get("/search", searchTransport);

module.exports = router;
