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
const { addToCart, removeFromCart } = require("./controllers/cartController");
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

// View cart (we'll build this page next)
app.get("/cart", (req, res) => {
  const cart = req.session.cart || {};

  // Convert cart object to array format expected by EJS template
  const cartItems = [];
  let totalAmount = 0;

  for (const id in cart) {
    const item = cart[id];
    cartItems.push({
      id: id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      image: item.image,
      total: item.price * item.qty,
    });
    totalAmount += item.price * item.qty;
  }

  res.render("cart", { cartItems, totalAmount });
});

// API endpoint for cart count (for navbar badge)
app.get("/api/cart/count", (req, res) => {
  const cart = req.session.cart || {};
  let totalItems = 0;

  // Count total quantity of all items (including duplicates)
  for (const id in cart) {
    totalItems += cart[id].qty;
  }

  res.json({ count: totalItems });
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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
