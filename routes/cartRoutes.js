const express = require('express');
const router = express.Router();
const { addToCart, removeFromCart, getCartPage } = require('../controllers/cartController');
const cartService = require('../services/cartService');

// Add to cart
router.get('/cart/add/:id', addToCart);
// Remove from cart
router.get('/cart/remove/:id', removeFromCart);
// View cart
router.get('/cart', getCartPage);
// API endpoint for cart count
router.get('/api/cart/count', (req, res) => {
  const cartSummary = cartService.calculateCartSummary(req.session.cart || {});
  res.json({ count: cartSummary.totalItems });
});

module.exports = router;
