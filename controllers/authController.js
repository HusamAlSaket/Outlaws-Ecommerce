const AuthService = require('../services/auth/AuthService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');  // Import the logger you created

// Show registration form
exports.getRegister = (req, res) => {
  res.render('auth/register', { errors: null, oldInput: null, showPasswordInfo: false });
};

exports.postRegister = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format the error messages and map them to the form fields
      const formattedErrors = {};
      for (const error of errors.array()) {
        // Only assign if param exists, otherwise use 'general'
        if (error.param && error.param !== '_error') {
          formattedErrors[error.param] = error.msg;
        } else {
          formattedErrors.general = error.msg;
        }
      }
      logger.error('Validation errors on registration', { errors: formattedErrors, body: req.body });
      return res.render('auth/register', { 
        errors: formattedErrors, 
        oldInput: req.body,
        showPasswordInfo: false
      });
    }

    try {
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
    } catch (serviceError) {
      logger.error(`Registration error from service: ${serviceError.message}`, { 
        email: req.body.email,
        error: serviceError.stack
      });
      
      // Create a properly formatted error object
      const errorObj = {};
      
      // Map specific errors to form fields
      if (serviceError.message.includes('Password must be')) {
        errorObj.password = "Password doesn't meet requirements";
        return res.render('auth/register', { 
          errors: errorObj, 
          oldInput: req.body,
          showPasswordInfo: true
        });
      } else if (serviceError.message.includes('Email already registered')) {
        errorObj.email = serviceError.message;
      } else if (serviceError.message.includes('Username already taken')) {
        errorObj.username = serviceError.message;
      } else {
        errorObj.general = serviceError.message;
      }
      
      return res.render('auth/register', { 
        errors: errorObj, 
        oldInput: req.body,
        showPasswordInfo: false
      });
    }
  } catch (error) {
    logger.error(`Registration error: ${error.message}`, { 
      email: req.body.email,
      error: error.stack
    });
    
    // Create a properly formatted error object
    const errorObj = { general: "An unexpected error occurred. Please try again." };
    
    res.render('auth/register', { 
      errors: errorObj, 
      oldInput: req.body,
      showPasswordInfo: false
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
    
    try {
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
    } catch (serviceError) {
      logger.error(`Login error from service: ${serviceError.message}`, {
        email: req.body.email,
        error: serviceError.stack
      });
      
      // For security reasons, we don't want to reveal exactly what's wrong
      const errorMessage = "Invalid email or password. Please check your credentials and try again.";
      
      // Return to login page with general error message
      return res.render('auth/login', { 
        errors: { general: errorMessage }, 
        oldInput: req.body 
      });
    }
  } catch (error) {
    logger.error(`Login error: ${error.message}`, {
      email: req.body.email,
      error: error.stack
    });
    
    res.render('auth/login', { 
      errors: { general: "An unexpected error occurred. Please try again." }, 
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