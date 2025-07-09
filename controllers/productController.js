const Product = require('../models/Product');

// Controller to fetch all products and render homepage
exports.getHomePage = async (req, res) => {
  try {
    const products = await Product.find().limit(6); // Trending products (first 6)
    const popularProducts = await Product.find({ popular: true }); // Popular products
    res.render('home', { products, popularProducts }); // Pass both to the view
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
