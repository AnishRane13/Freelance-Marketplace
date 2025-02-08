const express = require("express");
const router = express.Router(); 
const { getCategoriesController } = require("../../controllers/categories/getCategories");
const { storeCategoriesController } = require("../../controllers/categories/storeCategories")

router.get("/", getCategoriesController);
router.post("/", storeCategoriesController);

module.exports = router; 
