const express = require("express");
const cors = require("cors");
const userRoutes = require("./src/routes/user/userRoutes");
require("dotenv").config({ path: "./conf/.env" });


const app = express();
app.use(cors());
const PORT = 5000;

// Middleware to parse JSON
app.use(express.json());

// Use the user routes
app.use("/registerUser", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
