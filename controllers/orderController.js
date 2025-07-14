const Order = require('../models/Order');

exports.getCheckout = (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const cart = req.session.cart || {};

  // Redirect if cart is empty
  if (Object.keys(cart).length === 0) return res.redirect('/cart');

  // Transform cart object into an array
  const cartItems = [];
  let totalAmount = 0;

  for (const id in cart) {
    const item = cart[id];
    const itemTotal = item.price * item.qty;

    cartItems.push({
      id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      image: item.image,
      total: itemTotal
    });

    totalAmount += itemTotal;
  }

  res.render('checkout', {
    user: req.session.user,
    cartItems,
    totalAmount
  });
};

exports.postCheckout = async (req, res) => {
  const { fullName, address, city, postalCode, country } = req.body;
  const cart = req.session.cart || {};

  if (!req.session.user || Object.keys(cart).length === 0) {
    return res.redirect('/cart');
  }

  // Prepare items and total
  const items = [];
  let total = 0;
  for (const id in cart) {
    const item = cart[id];
    total += item.price * item.qty;
    items.push({
      productId: id,
      title: item.title,
      price: item.price,
      qty: item.qty
    });
  }

  const order = new Order({
    user: req.session.user._id,
    items,
    shippingInfo: { fullName, address, city, postalCode, country },
    totalAmount: total
  });

  await order.save();
  req.session.cart = {}; // Clear cart
  res.redirect('/orders'); // Add this route later
};

// Get user's orders
exports.getOrders = async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const orders = await Order.find({ user: req.session.user._id })
      .sort({ createdAt: -1 }); // Most recent first

    res.render('orders', {
      user: req.session.user,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
};
