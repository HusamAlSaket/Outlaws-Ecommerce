// routes/admin/admin-dashboard-routes.js
const express = require('express');
const router = express.Router();
const adminDashboardController = require('../../controllers/admin/admin-dashboard-controller');

// Dashboard routes
router.get('/', adminDashboardController.getDashboard);

// API endpoints for chart data
router.get('/api/orders-chart', adminDashboardController.getOrdersChartData);
router.get('/api/revenue-chart', adminDashboardController.getRevenueChartData);

module.exports = router;
