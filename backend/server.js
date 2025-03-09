
// server.js
require("dotenv").config({ path: "./conf/.env" });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");
const handleSocketEvents = require('./src/controllers/sockerHandlers');

// Import Routes
const registerRoutes = require("./src/routes/RegisterRoutes");
const loginRoutes = require("./src/routes/LoginRoutes");
const logoutRoutes = require("./src/routes/LogoutRoutes");
const categoriesRoutes = require("./src/routes/categories/categories");
const userRoutes = require("./src/routes/users/userRoutes");
const postRoutes = require("./src/routes/posts/postRoutes");
const subscriptionRoutes = require("./src/routes/subscriptions/subscriptionRoutes");
// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server & Socket.io Instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
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

// Make io available in routes
app.set('io', io);

// Initialize socket handlers
handleSocketEvents(io);

// Routes
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/categories", categoriesRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/subscription", subscriptionRoutes)

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});