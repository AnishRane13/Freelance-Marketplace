// src/models/interactions.js
const pool = require("../../db/db");

const getPostWithDetails = async (postId) => {
  // First, get the post details
  const postQuery = `
    SELECT 
      p.*,
      u.name as user_name,
      u.profile_picture,
      c.name as category_name,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
      (
        SELECT json_agg(pi.*)
        FROM post_images pi
        WHERE pi.post_id = p.post_id
      ) as images
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.post_id = $1`;
  
  const postResult = await pool.query(postQuery, [postId]);
  const post = postResult.rows[0];
  
  if (!post) return null;
  
  // Then, get the comments for this post
  const commentsQuery = `
    SELECT 
      c.comment_id,
      c.user_id,
      c.comment,
      c.created_at,
      u.name as user_name,
      u.profile_picture as user_profile
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC`;
  
  const commentsResult = await pool.query(commentsQuery, [postId]);
  
  // Add comments to the post object
  post.comments = commentsResult.rows;
  
  return post;
};


const getCommentsByPostId = async (postId) => {
  const query = `
    SELECT 
      c.comment_id,
      c.comment,
      c.created_at,
      c.user_id,
      u.name as user_name,
      u.profile_picture as user_profile
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC`;
  
  const result = await pool.query(query, [postId]);
  return result.rows;
};

const addLike = async (userId, postId) => {
  const query = `
    INSERT INTO likes (user_id, post_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, post_id) DO NOTHING
    RETURNING like_id`;
  
  const result = await pool.query(query, [userId, postId]);
  return result.rows[0] || null; // If like already exists, return null
};


const removeLike = async (userId, postId) => {
  const query = `
    DELETE FROM likes 
    WHERE user_id = $1 AND post_id = $2
    RETURNING like_id`;
  const result = await pool.query(query, [userId, postId]);
  return result.rows[0];
};

const getLikesCount = async (postId) => {
  const query = `
    SELECT COUNT(*) as count 
    FROM likes 
    WHERE post_id = $1`;
  const result = await pool.query(query, [postId]);
  return parseInt(result.rows[0].count);
};

const addComment = async (userId, postId, comment) => {
  const query = `
    INSERT INTO comments (user_id, post_id, comment)
    VALUES ($1, $2, $3)
    RETURNING 
        comment_id,
        user_id,
        comment,
        created_at;
  `;

  const result = await pool.query(query, [userId, postId, comment]);
  
  // Get user details separately to match the schema
  const userQuery = `
    SELECT name as user_name, profile_picture as user_profile
    FROM users 
    WHERE user_id = $1;
  `;
  
  const userResult = await pool.query(userQuery, [userId]);
  
  // Combine the results
  return {
    ...result.rows[0],
    ...userResult.rows[0]
  };
};

const getPostsWithDetails = async () => {
  // console.log('Fetching all posts');

  try {
    const query = `
      SELECT 
        p.*,
        u.name AS user_name,
        u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) AS comments_count,
        (
          SELECT COALESCE(json_agg(pi.*), '[]'::json)
          FROM post_images pi
          WHERE pi.post_id = p.post_id
        ) AS images
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC`;

    // console.log('Executing query...');
    const result = await pool.query(query);
    // console.log(`Query returned ${result.rows.length} rows`);

    return result.rows;
  } catch (error) {
    console.error('Error in getPostsWithDetails:', error);
    throw error;
  }
};

const getFilteredPosts = async (user_id) => {
  // console.log('Fetching filtered posts for user:', user_id);

  try {
    // Validate user_id
    if (!user_id || isNaN(parseInt(user_id))) {
      console.error('Invalid user_id:', user_id);
      return [];
    }

    // Fetch user's selected categories
    const categoryQuery = `SELECT categories FROM users WHERE user_id = $1`;
    const categoryResult = await pool.query(categoryQuery, [parseInt(user_id)]);

    if (!categoryResult.rows.length || !categoryResult.rows[0].categories.length) {
      console.error('No categories found for user:', user_id);
      return [];
    }

    const userCategories = categoryResult.rows[0].categories;
    // console.log('User selected categories:', userCategories);

    // Fetch posts based on user's selected categories
    const query = `
      SELECT 
        p.*,
        u.name AS user_name,
        u.profile_picture,
        c.name AS category_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) AS comments_count,
        (
          SELECT COALESCE(json_agg(pi.*), '[]'::json)
          FROM post_images pi
          WHERE pi.post_id = p.post_id
        ) AS images
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.category_id = ANY($1)
      ORDER BY p.created_at DESC`;

    // console.log('Executing filtered query with:', userCategories);
    const result = await pool.query(query, [userCategories]);
    // console.log(`Filtered query returned ${result.rows.length} rows`);

    return result.rows;
  } catch (error) {
    console.error('Error in getFilteredPosts:', error);
    throw error;
  }
};

module.exports = {
  getPostsWithDetails,
  getFilteredPosts
};



module.exports = {
  addLike,
  removeLike,
  getLikesCount,
  addComment,
  getCommentsByPostId,
  getPostWithDetails,
  getPostsWithDetails,
  getFilteredPosts
};