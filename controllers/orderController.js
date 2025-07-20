const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Get checkout page
exports.getCheckout = asyncHandler(async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  logger.info('Checkout page requested', { userId: req.session.user._id, ip: req.ip });

  // Use cart service to get clean cart data
  const cartSummary = cartService.calculateCartSummary(req.session.cart || {});

  // Redirect if cart is empty
  if (cartSummary.isEmpty) {
    logger.warn('Checkout attempted with empty cart', { userId: req.session.user._id });
    return res.redirect('/cart');
  }

  logger.info('Checkout page loaded', { 
    userId: req.session.user._id,
    itemCount: cartSummary.items.length,
    totalAmount: cartSummary.totalAmount 
  });

  res.render('checkout', {
    user: req.session.user,
    cartItems: cartSummary.items,
    totalAmount: cartSummary.totalAmount
  });
});

// Process checkout
exports.postCheckout = asyncHandler(async (req, res) => {
  const { fullName, address, city, postalCode, country } = req.body;
  const userId = req.session.user?._id;
  const cart = req.session.cart || {};

  logger.info('Processing checkout', { userId, ip: req.ip });

  // Validation
  if (!userId) {
    logger.warn('Checkout attempted without authentication');
    return res.redirect('/login');
  }

  if (Object.keys(cart).length === 0) {
    logger.warn('Checkout attempted with empty cart', { userId });
    return res.redirect('/cart');
  }

  // Prepare shipping info
  const shippingInfo = { fullName, address, city, postalCode, country };

  // Use order service to create order
  const order = await orderService.createOrder(userId, cart, shippingInfo);

  // Clear cart after successful order
  req.session.cart = cartService.clearCart();

  logger.info('Checkout completed successfully', { 
    userId, 
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount 
  });

  res.redirect('/orders');
});

// Get user's orders
exports.getOrders = asyncHandler(async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user._id;
  
  logger.info('Orders page requested', { userId, ip: req.ip });

  // Use order service to get orders
  const orders = await orderService.getUserOrders(userId);

  logger.info('Orders page loaded', { 
    userId, 
    orderCount: orders.length 
  });

  res.render('orders', {
    user: req.session.user,
    orders
  });
});


