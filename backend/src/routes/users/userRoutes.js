const express = require("express");
const multer = require("multer");
const router = express.Router(); 
const { registerUserController } = require("../../controllers/users/register/registerUser.js");
const { getUserByIdController } = require("../../controllers/users/dashboard/getUserByIdController.js");
const { uploadProfileImage } = require("../../controllers/uploadProfileImage.js");


// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."));
    }
    cb(null, true);
  },
});

// Route for uploading user images
router.post("/:userId/upload", upload.single("image"), uploadProfileImage);

module.exports = router;

router.post("/", registerUserController);

router.get("/:id", getUserByIdController);



module.exports = router; 
