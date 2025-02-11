const { registerUser } = require("../models/register");

const registerController = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;

    console.log(typeof(type))

    if (!name || !email || !password || !type) {
      return res.status(400).json({ error: "Name, Email, Password, and Type are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!["user", "company"].includes(type)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    const newUser = await registerUser(name, email, password, type);

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error.message);
    if (error.code === "23505") {
      res.status(409).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

module.exports = { registerController };
