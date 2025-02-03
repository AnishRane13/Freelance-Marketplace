const express = require("express");
const router = express.Router(); 
const { registerUserController } = require("../../controllers/users/register/registerUser.js");

router.post("/", registerUserController);

module.exports = router; 
