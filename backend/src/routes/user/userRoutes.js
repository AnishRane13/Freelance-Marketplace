const express = require("express");
const router = express.Router(); // Use express.Router()
const { registerUserController } = require("../../controllers/users/registerUser");

// Define the route
router.post("/registerUser", registerUserController);

module.exports = router; // Export the router
