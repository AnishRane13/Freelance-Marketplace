const express = require("express");
const router = express.Router(); 
const { getCategoriesController } = require("../../controllers/categories/getCategories");
const { storeCategoriesController } = require("../../controllers/categories/storeCategories");
const { getCategoriesByIdController } = require("../../controllers/categories/getCategoriesById");
router.get("/", getCategoriesController);
router.post("/", storeCategoriesController);
router.get("/:id", getCategoriesByIdController);

module.exports = router; 
