const express = require("express");
const router = express.Router();
const { registerCompanyController } = require('../../controllers/company//register/registerCompany')

router.post("/", registerCompanyController);

module.exports = router;
