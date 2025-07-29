const express = require('express');
const router = express.Router();
const { getHomePage, getProductDetails, getProductsPage } = require('../controllers/productController');

// Home
router.get('/', getHomePage);
// Products
router.get('/products', getProductsPage);
router.get('/products/:id', getProductDetails);

module.exports = router;
