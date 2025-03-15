const express = require("express");
const router = express.Router();
const { submitQuote, getUserQuotes, acceptQuote } = require("../../controllers/quotes/quoteController");

router.post("/", submitQuote); 
router.get("/:userId", getUserQuotes); 
router.post("/accept/:quoteId", acceptQuote);

module.exports = router;
