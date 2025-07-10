const Product = require('../models/Product');

// add item to cart
exports.addToCart = async (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.query.qty) || 1; // Get quantity from query parameter

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    const cart = req.session.cart || {};

    if (cart[productId]) {
      // already in cart, calculate new quantity
      const newQuantity = cart[productId].qty + quantity;
      
      if (newQuantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        delete cart[productId];
      } else {
        // Update quantity
        cart[productId].qty = newQuantity;
      }
    } else {
      // new item (only if quantity is positive)
      if (quantity > 0) {
        cart[productId] = {
          title: product.title,
          price: product.price,
          image: product.image,
          qty: quantity,
        };
      }
    }

    req.session.cart = cart;
    res.redirect('/cart'); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding to cart');
  }
};

// remove item from cart
exports.removeFromCart = (req, res) => {
  const productId = req.params.id;

  if (!req.session.cart) return res.redirect("/cart");

  delete req.session.cart[productId];

  res.redirect("/cart");
};

// Display the cart page
exports.getCartPage = (req, res) => {
  const cart = req.session.cart || {};

  const cartItems = Object.entries(cart).map(([productId, item]) => {
    return {
      id: productId,
      title: item.title,
      price: item.price,
      image: item.image,
      qty: item.qty,
      total: item.qty * item.price
    };
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.render('cart', {
    cartItems,
    totalAmount
  });
};