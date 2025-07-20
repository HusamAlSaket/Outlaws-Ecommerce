const logger = require('./logger');
const { HTTP_STATUS, MESSAGES } = require('../config/constants');

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Handler Middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.logError(err, req);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  // Send error response
  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER).json({
    success: false,
    error: {
      message: error.message || MESSAGES.INTERNAL_ERROR,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Async wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  globalErrorHandler,
  asyncHandler
};