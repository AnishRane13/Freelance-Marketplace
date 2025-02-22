// src/models/interactions.js
const pool = require("../../db/db");

const getPostWithDetails = async (postId) => {
  const query = `
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
  
  const result = await pool.query(query, [postId]);
  return result.rows[0];
};

const addLike = async (userId, postId) => {
  const query = `
    INSERT INTO likes (user_id, post_id)
    VALUES ($1, $2)
    RETURNING like_id`;
  const result = await pool.query(query, [userId, postId]);
  return result.rows[0];
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
      comment,
      created_at,
      (SELECT name FROM users WHERE user_id = $1) as user_name,
      (SELECT profile_picture FROM users WHERE user_id = $1) as user_profile`;
  const result = await pool.query(query, [userId, postId, comment]);
  return result.rows[0];
};

const getPostsWithDetails = async (user_id) => {
  const query = `
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
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC`;

  const result = await pool.query(query, [user_id]);
  return result.rows;
};

const getFilteredPosts = async (categoryIds, user_id) => {
  const query = `
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
    WHERE p.category_id = ANY($1)
      AND p.user_id = $2 -- Fetches only the logged-in user's posts
    ORDER BY p.created_at DESC`;

  const result = await pool.query(query, [categoryIds, user_id]);
  return result.rows;
};


module.exports = {
  addLike,
  removeLike,
  getLikesCount,
  addComment,
  getPostWithDetails,
  getPostsWithDetails,
  getFilteredPosts
};