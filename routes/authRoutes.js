const express = require('express');
const router = express.Router();
const { getRegister, postRegister, getLogin, postLogin, logout, getProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.get('/register', getRegister);
router.post('/register', [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
], postRegister);

router.get('/login', getLogin);
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], postLogin);

router.get('/profile', requireAuth, getProfile);
router.get('/logout', logout);

// DEBUG ONLY - Remove in production
router.get('/debug/create-test-user', async (req, res) => {
  try {
    const testEmail = "test@example.com";
    let testUser = await require('../models/User').findOne({ email: testEmail });
    if (testUser) {
      return res.send(`Test user already exists. Email: ${testEmail}, Password: Test123`);
    }
    const userData = {
      username: "TestUser",
      email: testEmail,
      password: "Test123"
    };
    const user = await require('../services/auth/AuthService').registerUser(userData);
    res.send(`Test user created successfully. Email: ${testEmail}, Password: Test123`);
  } catch (error) {
    res.status(500).send(`Error creating test user: ${error.message}`);
  }
});

module.exports = router;
