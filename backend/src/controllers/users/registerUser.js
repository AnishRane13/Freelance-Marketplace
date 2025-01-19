const { registerUser } = require("../../models/users/registerUser");

const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json("Name, Emaill and Password are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const newUser = await registerUser(name, email, password);

    delete newUser.password;

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      // Unique violation
      res.status(409).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

module.exports = { registerUserController};
