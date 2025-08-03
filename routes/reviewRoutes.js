const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

// Post a review (must be logged in)
router.post('/products/:productId/reviews', requireAuth, reviewController.createReview);

// Get reviews for a product (API)
router.get('/products/:productId/reviews', reviewController.getProductReviews);

module.exports = router;
