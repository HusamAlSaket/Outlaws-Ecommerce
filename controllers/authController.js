const AuthService = require('../services/auth/AuthService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');  // Import the logger you created

// Show registration form
exports.getRegister = (req, res) => {
  res.render('auth/register', { errors: null, oldInput: null });
};

exports.postRegister = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format the error messages and map them to the form fields
      const formattedErrors = {};
      
      // Properly extract errors for each field
      for (const error of errors.array()) {
        formattedErrors[error.param] = error.msg;
      }
      
      return res.render('auth/register', { 
        errors: formattedErrors, 
        oldInput: req.body 
      });
    }

    // Register user
    const { user, authToken, refreshToken } = await AuthService.registerUser(req.body);
    
    // Set session
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.authToken = authToken; // Store auth token in session
    
    // Log successful registration
    logger.info(`User registered successfully: ${user.email}`);
    
    // Set a welcome flash message
    req.flash("success", `Welcome to Outlaws, ${user.username}! Your account has been created successfully.`);
    
    // Redirect to home
    res.redirect('/');
  } catch (error) {
    logger.error(`Registration error: ${error.message}`, { 
      email: req.body.email,
      error: error.stack
    });
    
    // Create a properly formatted error object
    const errorObj = { general: error.message };
    
    // If it's a password error, add it to the password field specifically
    if (error.message.includes('Password must be')) {
      errorObj.password = error.message;
      delete errorObj.general;
    }
    
    res.render('auth/register', { 
      errors: errorObj, 
      oldInput: req.body 
    });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { errors: null, oldInput: null });
};

exports.postLogin = async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format the error messages and map them to the form fields
      const formattedErrors = {};
      
      // Properly extract errors for each field
      for (const error of errors.array()) {
        formattedErrors[error.param] = error.msg;
      }
      
      return res.render('auth/login', { 
        errors: formattedErrors, 
        oldInput: req.body 
      });
    }
    
    const { email, password } = req.body;
    
    // Login user
    const { user, authToken } = await AuthService.loginUser(email, password);
    
    // Set session
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.authToken = authToken; // Store token in session
    
    // Log successful login
    logger.info(`User logged in: ${user.email}`);
    
    // Set a welcome back flash message
    req.flash("success", `Welcome back, ${user.username}!`);
    
    // Redirect to home
    res.redirect('/');
  } catch (error) {
    logger.error(`Login error: ${error.message}`, {
      email: req.body.email,
      error: error.stack
    });
    
    res.render('auth/login', { 
      errors: { general: error.message }, 
      oldInput: req.body 
    });
  }
};

exports.logout = (req, res) => {
  if (req.session.user) {
    logger.info(`User logged out: ${req.session.user.email}`);
  }
  req.session.destroy();
  res.redirect('/');
};

exports.getProfile = async (req, res) => {
  try {
    // Fetch user data
    const user = await AuthService.getUserById(req.session.user._id);
    
    // Fetch user's orders if the Order model exists
    let orders = [];
    try {
      const Order = require('../models/Order');
      orders = await Order.find({ user: req.session.user._id }).sort({ createdAt: -1 });
    } catch (orderError) {
      logger.warn(`Could not fetch orders for profile: ${orderError.message}`);
      // Continue anyway, we'll just show zero orders
    }
    
    // Render profile with both user and orders data
    res.render('profile', { user, orders });
  } catch (error) {
    logger.error(`Profile error: ${error.message}`, {
      userId: req.session.user?._id,
      error: error.stack
    });
    res.redirect('/');
  }
};