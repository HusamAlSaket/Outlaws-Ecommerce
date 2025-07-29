const express = require('express');
const router = express.Router();
const { getCheckout, postCheckout, getOrders } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/checkout', requireAuth, getCheckout);
router.post('/checkout', requireAuth, express.urlencoded({ extended: true }), postCheckout);
router.get('/orders', requireAuth, getOrders);

module.exports = router;
