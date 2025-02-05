const express = require("express");
const router = express.Router();
const { logoutController } = require("../controllers/logoutController");

// Logout route
router.post("/", logoutController);

module.exports = router;
