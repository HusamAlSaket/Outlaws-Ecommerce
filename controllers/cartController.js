const cartService = require('../services/cartService');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Add item to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.query.qty) || 1;

  logger.info('Cart add request', { productId, quantity, ip: req.ip });

  // Use service layer for business logic
  const updatedCart = await cartService.addToCart(productId, quantity, req.session.cart || {});
  
  // Update session
  req.session.cart = updatedCart;
  
  logger.info('Item added to cart successfully', { productId, quantity });

  // Check if it's an AJAX request (for quantity updates)
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const cartSummary = cartService.calculateCartSummary(updatedCart);
    return res.json({ 
      success: true, 
      message: 'Cart updated successfully',
      cartSummary 
    });
  }
  
  res.redirect('/cart');
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  logger.info('Cart remove request', { productId, ip: req.ip });

  // Use service layer
  const updatedCart = cartService.removeFromCart(productId, req.session.cart || {});
  
  // Update session
  req.session.cart = updatedCart;
  
  logger.info('Item removed from cart successfully', { productId });
  res.redirect('/cart');
});

// Display cart page
exports.getCartPage = asyncHandler(async (req, res) => {
  logger.info('Cart page requested', { ip: req.ip });

  // Use service layer to calculate cart summary
  const cartSummary = cartService.calculateCartSummary(req.session.cart || {});

  logger.info('Cart page loaded', { 
    itemCount: cartSummary.items.length,
    totalAmount: cartSummary.totalAmount 
  });

  res.render('cart', {
    cartItems: cartSummary.items,
    totalAmount: cartSummary.totalAmount,
    totalItems: cartSummary.totalItems,
    isEmpty: cartSummary.isEmpty
  });
});