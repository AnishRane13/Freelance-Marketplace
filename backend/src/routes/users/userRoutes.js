const express = require("express");
const router = express.Router(); 
const { registerUserController } = require("../../controllers/users/register/registerUser.js");
const { getUserByIdController } = require("../../controllers/users/dashboard/getUserByIdController.js");

router.post("/", registerUserController);

router.get("/:id", getUserByIdController);



module.exports = router; 
