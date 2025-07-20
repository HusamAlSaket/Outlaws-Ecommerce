module.exports = {
  // Product Configuration
  PRODUCTS: {
    TRENDING_LIMIT: 6,
    POPULAR_LIMIT: 8,
    DEFAULT_QUANTITY: 10,
    IMAGE_FORMATS: ["jpg", "jpeg", "png", "gif"],
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,   
  },

  // Error Messages
  MESSAGES: {
    // Product Messages
    PRODUCT_NOT_FOUND: "Product not found",
    PRODUCTS_LOADED: "Products loaded successfully",
    TRENDING_PRODUCTS_ERROR: "Failed to fetch trending products",
    POPULAR_PRODUCTS_ERROR: "Failed to fetch popular products",

    // General Messages
    INTERNAL_ERROR: "Internal server error occurred",
    VALIDATION_ERROR: "Validation error",

    // Success Messages
    SUCCESS: "Operation completed successfully",
  },

  // Database Configuration
  DATABASE: {
    CONNECTION_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Cart Configuration
  CART: {
    MAX_QUANTITY: 99,
    MIN_QUANTITY: 1,
  },
};
