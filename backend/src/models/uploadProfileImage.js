const pool = require("../../db/db");

// Update the user's profile picture or cover photo
const updateProfileImage = async (userId, type, imageUrl) => {
    const query = `
      UPDATE users
      SET ${type} = $1
      WHERE user_id = $2
      RETURNING ${type};
    `;
  
    const result = await pool.query(query, [imageUrl, userId]);
    return result.rowCount > 0 ? result.rows[0] : null;
  };
  
  module.exports = {
    updateProfileImage
  };