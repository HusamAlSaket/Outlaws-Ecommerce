const express =require ('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Admin middleware -must be authenticated and admin
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard home
router.get('/dashboard', adminController.getDashboard);

// API endpoints for chart data
router.get('/api/orders-chart', adminController.getOrdersChartData);
router.get('/api/revenue-chart', adminController.getRevenueChartData);


module.exports = router;