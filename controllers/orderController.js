const Order = require('../models/Order');
const Product = require('../models/Product');
const cartService = require('../services/cartService');

// generate a unique order number
function generateOrderNumber() {
  const prefix = 'OUTLAW';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${prefix}-${date}-${random}`;
}

exports.getCheckout = (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  // Use cart service to get clean cart data
  const cartSummary = cartService.calculateCartSummary(req.session.cart || {});

  // Redirect if cart is empty
  if (cartSummary.isEmpty) return res.redirect('/cart');

  res.render('checkout', {
    user: req.session.user,
    cartItems: cartSummary.items,
    totalAmount: cartSummary.totalAmount
  });
};

exports.postCheckout = async (req, res) => {
  const { fullName, address, city, postalCode, country } = req.body;
  const cart = req.session.cart || {};

  if (!req.session.user || Object.keys(cart).length === 0) {
    return res.redirect('/cart');
  }

  try {
    // Validate stock for all items before processing order
    const stockValidation = [];
    for (const id in cart) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(400).send(`Product not found: ${cart[id].title}`);
      }
      if (product.quantity < cart[id].qty) {
        stockValidation.push({
          title: product.title,
          requested: cart[id].qty,
          available: product.quantity
        });
      }
    }

    // If any items are out of stock, return error
    if (stockValidation.length > 0) {
      let errorMessage = 'Insufficient stock for the following items:\n';
      stockValidation.forEach(item => {
        errorMessage += `${item.title}: Requested ${item.requested}, Available ${item.available}\n`;
      });
      return res.status(400).send(errorMessage);
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
        qty: item.qty,
        image: item.image
      });
    }

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(), // Unique order number
      user: req.session.user._id,
      items,
      shippingInfo: { fullName, address, city, postalCode, country },
      totalAmount: total
    });

    await order.save();

    // Update product quantities
    for (const id in cart) {
      await Product.findByIdAndUpdate(id, {
        $inc: { quantity: -cart[id].qty }
      });
    }

    req.session.cart = {}; // Clear cart
    res.redirect('/orders');
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).send('Error processing order');
  }
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


