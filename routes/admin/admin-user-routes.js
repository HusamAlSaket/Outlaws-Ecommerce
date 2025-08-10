// routes/admin/admin-user-routes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/admin-user-controller');

// Users management routes
router.get('/', adminUserController.getUsers);

// API endpoints for user management
router.post('/api/:userId/toggle-status', adminUserController.toggleUserStatus);
router.get('/api/:userId/details', adminUserController.getUserDetails);

module.exports = router;
