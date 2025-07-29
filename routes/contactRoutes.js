const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { body } = require('express-validator');

router.get('/contact', contactController.getContactPage);
router.post('/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], contactController.postContact);

module.exports = router;
