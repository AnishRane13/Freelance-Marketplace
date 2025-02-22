const { getPostsWithDetails, getFilteredPosts } = require('../../models/interactions');

const getPostsController = async (req, res) => {
    try {
      const { user_id } = req.query;
      const posts = await getPostsWithDetails(user_id);
      res.json({
        success: true,
        posts
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts',
        error: error.message
      });
    }
  };

const getFilteredPostsController = async (req, res) => {
    try {
      const { categories } = req.body;
      const { user_id } = req.query; 
      const posts = await getFilteredPosts(categories, user_id); 
      res.json({
        success: true,
        posts
      });
    } catch (error) {
      console.error('Error fetching filtered posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch filtered posts',
        error: error.message
      });
    }
  };
  
  
  module.exports = {
    getPostsController,
    getFilteredPostsController
  };