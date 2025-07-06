const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5500",
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Explicitly handle OPTIONS requests
app.options("*", (req, res) => {
  console.log("Handling OPTIONS request for:", req.url);
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});

// Session middleware
app.use(
  session({
    name: "admin_session",
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Lax", // Use "None" with Secure: true for cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Session Middleware - Session ID:", req.sessionID);
  console.log("Session Middleware - Session Data:", req.session);
  next();
});

// Routes
const destinationRoutes = require("./routes/destinationRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const siderRoutes = require("./routes/siderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userController = require("../Backend-admin/controllers/usercontroller");

app.use("/api/admin", destinationRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/admin", siderRoutes);
app.use("/api/admin", adminRoutes);

// User routes
app.get("/users", userController.getUsers);
app.get("/users/:id", userController.getUserById);
app.get("/users/:name", userController.getUsersByName);
app.put("/users/:id", userController.updateUser);
app.put("/users/:id/block", userController.blockUser);
app.put("/users/:id/unblock", userController.unblockUser);
app.delete("/users/:id", userController.deleteUser);

// Debug session routes
app.get("/api/admin/debug-session", (req, res) => {
  console.log("Debug Session - Session ID:", req.sessionID);
  console.log("Debug Session - Session Data:", req.session);
  res.json(req.session || { message: "No active session" });
});

app.get("/api/admin/check-session", (req, res) => {
  console.log("Checking session...");
  if (req.session.admin) {
    return res.json({
      message: "Session active",
      session: {
        id: req.session.admin.id,
        role: req.session.admin.role,
        email: req.session.admin.email,
        permissions: req.session.admin.permissions || [],
      },
    });
  } else {
    return res.status(401).json({ message: "Unauthorized: No active session" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));