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

// Import middlewares
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');

// Import validation
const { body } = require('express-validator');



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
app.get("/checkout", requireAuth, getCheckout);
app.post("/checkout", requireAuth, express.urlencoded({ extended: true }), postCheckout);

// Orders Route
app.get("/orders", requireAuth, getOrders);

// Authentication Routes
app.get("/register", getRegister);
app.post("/register", [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
], postRegister);

app.get("/login", getLogin);
app.post("/login", [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], postLogin);

// DEBUG ONLY - Remove in production
app.get("/debug/create-test-user", async (req, res) => {
  try {
    // Check if test user exists
    const testEmail = "test@example.com";
    let testUser = await require('./models/User').findOne({ email: testEmail });
    
    if (testUser) {
      return res.send(`Test user already exists. Email: ${testEmail}, Password: Test123`);
    }
    
    // Create test user with known credentials
    const userData = {
      username: "TestUser",
      email: testEmail,
      password: "Test123"
    };
    
    const user = await require('./services/auth/AuthService').registerUser(userData);
    res.send(`Test user created successfully. Email: ${testEmail}, Password: Test123`);
  } catch (error) {
    res.status(500).send(`Error creating test user: ${error.message}`);
  }
});

app.get("/profile", requireAuth, getProfile);

app.get("/logout", logout);

// Contact Routes
app.get('/contact', contactController.getContactPage);
app.post('/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], contactController.postContact);

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
