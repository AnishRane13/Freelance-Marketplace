const express = require("express");
const router = express.Router();
const { submitQuote, getUserQuotes } = require("../../controllers/quotes/quoteController");

router.post("/", submitQuote); 
router.get("/:userId", getUserQuotes); 

module.exports = router;
