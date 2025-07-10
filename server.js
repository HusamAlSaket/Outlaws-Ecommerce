// Load environment variables from .env file
require("dotenv").config();

// import required modules

const express = require("express");
const mongoose = require("mongoose");
const app = express();

// middleware to serve static files like css

app.use(express.static("public"));

// set the view engine to ejs (Embedded JavaScript)

app.set("view engine", "ejs");

// Import Controller
const { getHomePage,getProductDetails } = require("./controllers/productController");

// Home Route
app.get("/", getHomePage);

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});


// product details route
app.get("/products/:id", getProductDetails);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
