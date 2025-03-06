const pool = require("../../../db/db");

const getUserPosts = async (userId) => {
    const postsQuery = `
        SELECT 
            p.post_id,
            p.content,
            p.created_at,
            u.name AS user_name,
            u.profile_picture,
            c.name AS category_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) AS likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) AS comments_count,
            COALESCE(
                json_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
            ) AS images
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN post_images pi ON pi.post_id = p.post_id
        WHERE p.user_id = $1
        GROUP BY p.post_id, u.name, u.profile_picture, c.name
        ORDER BY p.created_at DESC`;

    const postsResult = await pool.query(postsQuery, [userId]);
    const posts = postsResult.rows;

    for (let post of posts) {
        const commentsQuery = `
            SELECT 
                c.comment_id,
                c.user_id,
                c.comment,
                c.created_at,
                u.name AS user_name,
                u.profile_picture AS user_profile
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC`;

        const commentsResult = await pool.query(commentsQuery, [post.post_id]);
        post.comments = commentsResult.rows;
    }

    return posts;
};

module.exports = { getUserPosts };