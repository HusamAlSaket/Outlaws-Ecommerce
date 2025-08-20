const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

class ReviewService {
    async getAllReviews() {
        return await Review.find({})
            .populate('user', 'username')
            .populate('product', 'title');
    }

    async getReviewStats() {
        const totalReviews = await Review.countDocuments();
        const visibleReviews = await Review.countDocuments({ isVisible: true });
        return { totalReviews, visibleReviews };
    }

    async toggleReviewVisibility(reviewId, isVisible) {
        const review = await Review.findByIdAndUpdate(reviewId, { isVisible }, { new: true });
        if (!review) throw new Error('Review not found');
        return review;
    }

    async deleteReview(reviewId) {
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) throw new Error('Review not found');
        return review;
    }
}

module.exports = new ReviewService();
