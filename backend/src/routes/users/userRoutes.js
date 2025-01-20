const express = require("express");
const router = express.Router(); 
const { registerUserController } = require("../../controllers/users/registerUser");


router.post("/", registerUserController);

module.exports = router; 
