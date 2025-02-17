const pool = require("../../../db/db");

// Function to create a post
// In your createPost model function
const createPost = async (userId, content, categoryId) => {
    const query = `
      INSERT INTO posts (user_id, content, category_id)
      VALUES ($1, $2, $3)
      RETURNING post_id
    `;
    const values = [userId, content, categoryId || null];
    const result = await pool.query(query, values);
    return result.rows[0].post_id;
  };

// Function to save multiple post images
const savePostImages = async (postId, imageUrls) => {
  const query = `
    INSERT INTO post_images (post_id, image_url)
    VALUES ($1, $2)
  `;

  // Insert each image URL
  for (const imageUrl of imageUrls) {
    await pool.query(query, [postId, imageUrl]);
  }
};

module.exports = {
  createPost,
  savePostImages,
};
