// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Import admin routes from admin folder
const adminRoutes = require('./admin');

// Mount all admin routes
router.use('/', adminRoutes);

module.exports = router;