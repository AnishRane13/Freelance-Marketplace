const express = require("express");
const multer = require("multer");
const router = express.Router();
const { createPostWithImagesController } = require("../../controllers/posts/createPost");
const { authenticateToken } = require('../../middleware/auth');
const { getPostsController, getFilteredPostsController } = require('../../controllers/posts/getPosts');

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."));
    }
    cb(null, true);
  },
});

// Route for creating a post with multiple images
router.post("/", upload.array("images"), createPostWithImagesController);
// Updated API calls
router.get("/", authenticateToken, getPostsController);
router.get("/filtered", authenticateToken, getFilteredPostsController);


module.exports = router;
