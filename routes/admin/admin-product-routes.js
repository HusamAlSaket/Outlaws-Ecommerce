// routes/admin/admin-product-routes.js
const express = require('express');
const router = express.Router();
const adminProductController = require('../../controllers/admin/admin-product-controller');

// Products management routes
router.get('/', adminProductController.getProducts);

// API endpoints for product management
router.post('/api/:productId/toggle-status', adminProductController.toggleProductStatus);
router.get('/api/:productId/details', adminProductController.getProductDetails);

// CRUD operations
router.post('/api/create', adminProductController.createProduct);
router.put('/api/:productId/update', adminProductController.updateProduct);
router.delete('/api/:productId/delete', adminProductController.deleteProduct);

module.exports = router;
