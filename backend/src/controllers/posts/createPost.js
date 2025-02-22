const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { createPost, savePostImages } = require("../../models/posts/createPost");
const { getPostWithDetails } = require("../../models/interactions"); // Fixed import path

// Configure S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload a file to S3
const uploadToS3 = async (file, postId) => {
  try {
    const fileExtension = file.mimetype.split("/")[1];
    const fileName = `${postId}/images/${Date.now()}-${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};

// Controller for creating a post with multiple images
const createPostWithImagesController = async (req, res) => {
  const { userId, content, category_id } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ 
      success: false, 
      message: "User ID and content are required" 
    });
  }

  try {
    // Create the post first
    const postId = await createPost(userId, content, category_id);

    // Handle image uploads if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload images in parallel for better performance
      const uploadPromises = req.files.map(file => uploadToS3(file, postId));
      imageUrls = await Promise.all(uploadPromises);
      
      // Save image URLs to database
      await savePostImages(postId, imageUrls);
    }

    // Get the complete post data with all details
    const postData = await getPostWithDetails(postId);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('post_created', postData);
    }

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: postData
    });
  } catch (error) {
    console.error("Error creating post with images:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error creating post with images",
      error: error.message 
    });
  }
};

module.exports = {
  createPostWithImagesController,
};