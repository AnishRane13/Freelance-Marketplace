const { getPostsWithDetails, getFilteredPosts,  } = require('../../models/interactions');
const { getUserPosts } = require("../../models/posts/getPost");

const getPostsController = async (req, res) => {
    try {
        const posts = await getPostsWithDetails();
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
        const { user_id } = req.query;

        if (!user_id || isNaN(parseInt(user_id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing user_id'
            });
        }

        const posts = await getFilteredPosts(user_id);
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

const getAllPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing user ID",
            });
        }

        const posts = await getUserPosts(userId);
        res.json({
            success: true,
            posts
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message,
        });
    }
};

module.exports = {
    getPostsController,
    getFilteredPostsController,
    getAllPostsByUser
};
