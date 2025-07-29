// Load environment variables from .env file
require("dotenv").config();

// import required modules

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");

// middleware to serve static files like css

app.use(express.static("public"));

// set the view engine to ejs (Embedded JavaScript)

app.set("view engine", "ejs");

// Body parsing middleware - MUST come before routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set the session middleware

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize flash middleware
app.use(flash());

// Global middleware to make user and flash messages available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

// Use modular routers
app.use("/", require("./routes/productRoutes"));
app.use("/", require("./routes/cartRoutes"));
app.use("/", require("./routes/orderRoutes"));
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/contactRoutes"));
app.use("/", require("./routes/aboutRoutes"));

// Global Error Handler - MUST be last middleware
const { globalErrorHandler } = require("./utils/errorHandler");
app.use(globalErrorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000, // Timeout after 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error("💡 Common solutions:");
    console.error("   1. Check if your IP is whitelisted in MongoDB Atlas");
    console.error("   2. Verify your username and password");
    console.error("   3. Check your internet connection");
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
