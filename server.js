// Load environment variables from .env file
require("dotenv").config();

// import required modules

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");

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

// Global middleware to make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import Controller
const {
  getHomePage,
  getProductDetails,
  getProductsPage,
} = require("./controllers/productController");
const { addToCart, removeFromCart, getCartPage } = require("./controllers/cartController");
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getProfile,
} = require("./controllers/authController");

const {
  getCheckout,
  postCheckout,
  getOrders,
} = require("./controllers/orderController");
const contactController = require('./controllers/contactController');



// Home Route
app.get("/", getHomePage);

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

// Products Route
app.get("/products", getProductsPage);

// product details route
app.get("/products/:id", getProductDetails);

// Cart Routes

// Add to cart
app.get("/cart/add/:id", addToCart);

// Remove from cart
app.get("/cart/remove/:id", removeFromCart);

// View cart - now uses clean service layer
app.get("/cart", getCartPage);

// Import cart service
const cartService = require('./services/cartService');

// API endpoint for cart count (for navbar badge)
app.get("/api/cart/count", (req, res) => {
  const cartSummary = cartService.calculateCartSummary(req.session.cart || {});
  res.json({ count: cartSummary.totalItems });
});

// Checkout Routes
app.get("/checkout", getCheckout);
app.post("/checkout", express.urlencoded({ extended: true }), postCheckout);

// Orders Route
app.get("/orders", getOrders);

// Authentication Routes
app.get("/register", getRegister);
app.post("/register", postRegister);

app.get("/login", getLogin);
app.post("/login", postLogin);

app.get("/profile", getProfile);

app.get("/logout", logout);

// Contact Routes
app.get('/contact', contactController.getContactPage);
app.post('/contact', contactController.postContact);

// Global Error Handler - MUST be last middleware
const { globalErrorHandler } = require('./utils/errorHandler');
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
