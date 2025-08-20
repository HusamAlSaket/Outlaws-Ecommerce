const Review = require('../models/Review');
const { hasPurchasedProduct } = require('../services/orderService');

exports.createReview = async (req, res) => {
  const { product, rating, comment } = req.body;
  const userId = req.session.user._id;

  // Check if user purchased the product
  const purchased = await hasPurchasedProduct(userId, product);
  if (!purchased) {
    return res.redirect(`/products/${product}`);
  }

  try {
    const review = new Review({
      product: product,
      user: userId,
      rating,
      comment
    });
    await review.save();
    res.redirect(`/products/${product}`);
  } catch (err) {
    res.redirect(`/products/${product}`);
  }
};

exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId, isVisible: true }).populate('user', 'username');
  res.json(reviews);
};