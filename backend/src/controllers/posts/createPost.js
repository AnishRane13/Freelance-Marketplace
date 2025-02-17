const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { createPost, savePostImages } = require("../../models/posts/createPost");

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
};

// Controller for creating a post with multiple images
const createPostWithImagesController = async (req, res) => {
    let { userId, content, category_id } = req.body;
  
    console.log(req.body);
    console.log(typeof(category_id))
  
    if (!userId || !content) {
      return res.status(400).json({ success: false, message: "User ID and content are required" });
    }
  
    // Ensure categoryId is treated as an integer
    categoryId = parseInt(category_id, 10);
  
    try {
      // Step 1: Create the post
      const postId = await createPost(userId, content, category_id);
  
      // Step 2: Upload images if provided
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadToS3(file, postId);
          imageUrls.push(imageUrl);
        }
  
        // Step 3: Save image URLs to the database
        await savePostImages(postId, imageUrls);
      }
  
      res.status(201).json({
        success: true,
        message: "Post created successfully",
        postId,
        imageUrls,
      });
    } catch (error) {
      console.error("Error creating post with images:", error);
      res.status(500).json({ success: false, message: "Error creating post with images" });
    }
  };
  
module.exports = {
  createPostWithImagesController,
};
