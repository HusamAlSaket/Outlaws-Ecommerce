// middleware/authMiddleware.js
const TokenService = require('../services/auth/TokenService');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.requireAuth = async (req, res, next) => {
  // Get token from header or session
  const token = req.headers.authorization?.split(' ')[1] || req.session.authToken;

  if (!token) {
    logger.warn('Authentication required but no token provided');
    // Store intended URL for redirect after login
    req.session.returnTo = req.originalUrl;
    return res.status(401).redirect('/login');
  }

  // Verify token
  const decoded = TokenService.verifyToken(token);
  if (!decoded) {
    logger.warn('Invalid authentication token provided');
    req.session.returnTo = req.originalUrl;
    return res.status(401).redirect('/login');
  }

  try {
    // Fetch full user data from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      logger.warn('User not found in database');
      req.session.returnTo = req.originalUrl;
      return res.status(401).redirect('/login');
    }

    // Add full user data to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error fetching user data:', error);
    req.session.returnTo = req.originalUrl;
    return res.status(401).redirect('/login');
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    logger.warn(`User ${req.user?.username || req.user?.email} attempted to access admin route without permission`);
    return res.status(403).redirect('/');
  }
  next();
};