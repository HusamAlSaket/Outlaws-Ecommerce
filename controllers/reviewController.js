const Review = require('../models/Review');
const { hasPurchasedProduct } = require('../utils/purchaseChecker');

exports.createReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.session.user._id;

  // Check if user purchased the product
  const purchased = await hasPurchasedProduct(userId, productId);
  if (!purchased) {
    return res.status(403).json({ message: 'You can only review products you have purchased.' });
  }

  try {
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment
    });
    await review.save();
    res.redirect(`/products/${productId}`);
  } catch (err) {
    res.status(400).json({ message: 'You have already reviewed this product or invalid data.' });
  }
};

exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId }).populate('user', 'username');
  res.json(reviews);
};