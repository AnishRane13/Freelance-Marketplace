const pool = require("../../db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const loginController = async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (!email || !password || !type) {
      return res.status(400).json({ success: false, error: "Email, password, and type are required" });
    }

    // Ensure type is either 'user' or 'company'
    if (!["user", "company"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid user type" });
    }

    const tableName = type === "user" ? "users" : "company";

    // Get user or company from DB
    const query = `SELECT * FROM ${tableName} WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.user_id || user.company_id, email: user.email, type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set session securely
    req.session.user = {
      id: user.user_id || user.company_id,
      email: user.email,
      type,
    };

    // Remove sensitive data before sending response
    const { password: _, categories, ...userData } = user;
    const selectedCategories = categories ? JSON.parse(categories) : [];

    res.json({ success: true, message: "Login successful", user: userData,  categoriesSelected: selectedCategories.length > 0,  token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { loginController };
