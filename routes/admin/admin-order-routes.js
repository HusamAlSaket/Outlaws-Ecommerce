// routes/admin/admin-order-routes.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/admin/admin-order-controller');


// Render order details page
router.get('/details/:orderId', adminOrderController.renderOrderDetailsPage);

// Orders management routes
router.get('/', adminOrderController.getOrders);

// API endpoints for order management
router.post('/api/:orderId/toggle-payment', adminOrderController.toggleOrderPaymentStatus);
router.get('/api/:orderId/details', adminOrderController.getOrderDetails);

// CRUD operations
router.put('/api/:orderId/update', adminOrderController.updateOrder);
router.delete('/api/:orderId/delete', adminOrderController.deleteOrder);

module.exports = router;
