const reviewService = require('../../services/reviewService');

module.exports = {
    async getReviewsPage(req, res) {
        try {
            const reviews = await reviewService.getAllReviews();
            const reviewStats = await reviewService.getReviewStats();
            res.render('admin/reviews', {
                title: 'Reviews Management',
                user: req.user,
                reviews,
                reviewStats
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    },

    async toggleReviewVisibility(req, res) {
        try {
            const { reviewId } = req.params;
            const { isVisible } = req.body;
            await reviewService.toggleReviewVisibility(reviewId, isVisible);
            res.json({ success: true });
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    },

    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            await reviewService.deleteReview(reviewId);
            res.json({ success: true });
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    }
};
