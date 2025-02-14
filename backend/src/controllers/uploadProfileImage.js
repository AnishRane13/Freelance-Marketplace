const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { updateProfileImage } = require("../models/uploadProfileImage");

// Configure S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload file to S3
const uploadToS3 = async (file, userId, type) => {
  const fileExtension = file.mimetype.split("/")[1];
  const fileName = `${userId}/${type}/${Date.now()}-${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  // Upload the file to S3
  await s3.send(new PutObjectCommand(params));

  // Return the public URL of the uploaded file
  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};

const uploadProfileImage = async (req, res) => {
    const { userId } = req.params;
    const type = req.body.type; // Correctly extract `type`
  
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
  
    console.log("Type:", type); // Debug the value of `type`
  
    if (!["profile_picture", "cover_photo"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }
  
    try {
      // Upload to S3
      const imageUrl = await uploadToS3(req.file, userId, type);
  
      // Update the user's image in the database
      const updatedUser = await updateProfileImage(userId, type, imageUrl);
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, message: "Error uploading image" });
    }
  };
  

module.exports = {
  uploadProfileImage,
};
