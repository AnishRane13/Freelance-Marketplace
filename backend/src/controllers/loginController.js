const pool = require("../../db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const loginController = async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (!email || !password || !type) {
      return res.status(400).json({ error: "Email, password, and type are required" });
    }

    const tableName = type === "user" ? "users" : "company";
    
    // Get user or company from DB
    const query = `SELECT * FROM ${tableName} WHERE email = $1`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.user_id || user.company_id, email: user.email, type }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set session
    req.session.user = {
      id: user.user_id || user.company_id,
      email: user.email,
      type,
    };

    // Remove password before sending response
    delete user.password;

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { loginController };
