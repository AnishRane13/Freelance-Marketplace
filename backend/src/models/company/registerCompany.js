const pool = require('../../../db/db');

const registerCompany = async (name, email, password) => {
    const query = `
    INSERT INTO company (
    name, email, password)
    VALUES ($1, $2, $3)
    RETURNING 
    company_id, name, email, password
    `;

    const values = [name, email, password];

    const result = await pool.query(query, values);

    return result.rows[0];
}

module.exports = { registerCompany };