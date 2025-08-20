const express = require('express');
const router = express.Router();
const adminReviewController = require('../../controllers/admin/admin-review-controller');
const { requireAdmin } = require('../../middleware/authMiddleware');

router.get('/', requireAdmin, adminReviewController.getReviewsPage);
router.put('/:reviewId/toggle-visibility', requireAdmin, adminReviewController.toggleReviewVisibility);
router.delete('/:reviewId', requireAdmin, adminReviewController.deleteReview);

module.exports = router;
