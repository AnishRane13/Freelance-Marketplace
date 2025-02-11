const bcrypt = require("bcryptjs");
const pool = require("../../db/db");

const registerUser = async (name, email, password, type) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const userQuery = `
    INSERT INTO users (name, email, password, user_type)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, name, email, user_type
  `;
  const userValues = [name, email, hashedPassword, type];

  const userResult = await pool.query(userQuery, userValues);
  const newUser = userResult.rows[0];

  if (type === "company") {
    const companyQuery = `
      INSERT INTO companies (user_id)
      VALUES ($1)
      RETURNING company_id
    `;
    const companyValues = [newUser.user_id];
    const companyResult = await pool.query(companyQuery, companyValues);
    newUser.company_id = companyResult.rows[0].company_id;
  }

  return newUser;
};

module.exports = { registerUser };
