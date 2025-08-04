const productService = require('../services/productService');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Controller to fetch all products and render homepage
exports.getHomePage = asyncHandler(async (req, res) => {
  logger.info('Home page requested', { ip: req.ip, userAgent: req.get('User-Agent') });
  
  // Use service layer for business logic
  const trendingProducts = await productService.getTrendingProducts();
  const popularProducts = await productService.getPopularProducts();
  
  logger.info('Home page data loaded successfully', { 
    trendingCount: trendingProducts.length,
    popularCount: popularProducts.length 
  });
  
  res.render('home', { 
    products: trendingProducts, 
    popularProducts: popularProducts 
  });
});

// Controller to fetch a single product by ID
exports.getProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Product details requested', { productId: id, ip: req.ip });
  // Use service layer - it handles validation and errors
  const { product, reviews, canReview, hasReviewed } = await productService.getProductById(id, req.session.user?._id);
  logger.info('Product details loaded successfully', { productId: id, title: product.title });
  res.render('productDetails', { product, reviews, canReview, hasReviewed });
});

// Controller to fetch products for the products page
exports.getProductsPage = asyncHandler(async (req, res) => {
  logger.info('Products page requested', { query: req.query, ip: req.ip });
  
  // Use service layer with query parameters (search, category, pagination)
  const result = await productService.getAllProducts(req.query);
  
  logger.info('Products page data loaded successfully', { 
    totalProducts: result.pagination.total,
    currentPage: result.pagination.current 
  });
  
  res.render('products', { 
    products: result.products,
    pagination: result.pagination,
    query: req.query 
  });
});
