const express = require("express");
const cors = require("cors");
const session = require("express-session");
// const userRoutes = require("./src/routes/users/userRoutes");
// const companyRoutes = require("./src/routes/company/companyRoutes")
require("dotenv").config({ path: "./conf/.env" });
const registerRoutes = require("./src/routes/RegisterRoutes")
const loginRoutes = require("./src/routes/LoginRoutes");
const logoutRoutes = require("./src/routes/LogoutRoutes");
const categoriesRoutes = require("./src/routes/categories/categories")
const userRoutes = require("./src/routes/users/userRoutes");
const postRoutes = require("./src/routes/posts/postRoutes");

const app = express();
// app.use(cors());
const PORT = 5000;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

// Middleware to parse JSON
app.use(express.json());

// Use the user routes
app.use("/register", registerRoutes);

app.use("/users", userRoutes);

// app.use("/registerCompany", companyRoutes);
app.use("/posts", postRoutes);

app.use("/categories", categoriesRoutes)

app.use("/login", loginRoutes);

app.use("/logout", logoutRoutes );


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
