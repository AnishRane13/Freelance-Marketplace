const pool = require("../../../db/db");

const registerUser = async (name, email, password) => {
    const query = `
    INSERT INTO users (
    name, email, password)
    VALUES ($1, $2, $3)
    RETURNING
    user_id, name, email, password
    `;

    const values = [name, email, password];

    const result = await pool.query(query, values);

    return result.rows[0];
};

module.exports = { registerUser};