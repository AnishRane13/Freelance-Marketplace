// Model: getUserById.js
const pool = require("../../../db/db");

const getUserById = async (userId) => {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.email,
            u.user_type,
            u.profile_picture,
            u.cover_photo,
            u.bio,
            u.categories,
            u.created_at,
            c.website,
            c.location,
            c.description
        FROM users u
        LEFT JOIN companies c ON u.user_id = c.user_id
        WHERE u.user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

module.exports = { getUserById };

// Controller: getUserController.js