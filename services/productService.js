const Product = require('../models/Product');
const { PRODUCTS, MESSAGES, PAGINATION } = require('../config/constants');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const Review = require('../models/Review');
const { hasPurchasedProduct } = require('./orderService');

class ProductService {
  // Get trending products for home page
  async getTrendingProducts() {
    try {
      logger.info('Fetching trending products');
      
      const products = await Product.find()
        .limit(PRODUCTS.TRENDING_LIMIT)
        .select('title description price image quantity')
        .lean(); // Better performance - returns plain JS objects
      
      logger.info(`Found ${products.length} trending products`);
      return products;
    } catch (error) {
      logger.error('Error fetching trending products:', error);
      throw new AppError(MESSAGES.TRENDING_PRODUCTS_ERROR, 500);
    }
  }

  // Get popular products for home page
  async getPopularProducts() {
    try {
      logger.info('Fetching popular products');
      
      const products = await Product.find({ popular: true })
        .limit(PRODUCTS.POPULAR_LIMIT)
        .select('title description price image quantity')
        .lean();
      
      logger.info(`Found ${products.length} popular products`);
      return products;
    } catch (error) {
      logger.error('Error fetching popular products:', error);
      throw new AppError(MESSAGES.POPULAR_PRODUCTS_ERROR, 500);
    }
  }

  // Get single product by ID
 async getProductById(id, userId = null) {
  try {
    if (!id) throw new AppError('Product ID is required', 400);

    logger.info(`Fetching product with ID: ${id}`);
    const product = await Product.findById(id);
    if (!product) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404);

    // Always fetch reviews
    const reviews = await Review.find({ product: id }).populate('user');

    // Optionally check if user can review
    let canReview = false;
    if (userId) {
      canReview = await hasPurchasedProduct(userId, id);
    }

    return { product, reviews, canReview };
  } catch (error) {
    if (error.isOperational) throw error;
    logger.error('Error fetching product by ID:', error);
    throw new AppError('Failed to fetch product', 500);
  }
}

  // Get all products with optional filtering
  async getAllProducts(queryParams = {}) {
    try {
      const { 
        page = PAGINATION.DEFAULT_PAGE, 
        limit = PAGINATION.DEFAULT_LIMIT, 
        category, 
        search 
      } = queryParams;
      
      // Convert to integers to avoid string concatenation issues
      const currentPage = parseInt(page) || PAGINATION.DEFAULT_PAGE;
      const currentLimit = parseInt(limit) || PAGINATION.DEFAULT_LIMIT;
      
      // Enforce max limit
      const finalLimit = Math.min(currentLimit, PAGINATION.MAX_LIMIT);
      
      logger.info('Fetching all products with filters:', { 
        ...queryParams, 
        parsedPage: currentPage, 
        parsedLimit: finalLimit 
      });
      
      // Build query
      let query = {};
      
      if (category) {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const products = await Product.find(query)
        .limit(finalLimit)
        .skip((currentPage - 1) * finalLimit)
        .select('title description price image quantity category')
        .lean();

      const total = await Product.countDocuments(query);

      logger.info(`Found ${products.length} products (${total} total)`);
      
      return {
        products,
        pagination: {
          current: currentPage,
          pages: Math.ceil(total / finalLimit),
          total,
          limit: finalLimit
        }
      };
    } catch (error) {
      logger.error('Error fetching all products:', error);
      throw new AppError('Failed to fetch products', 500);
    }
  }

  // Check if product is in stock
  async checkStock(productId, quantity = 1) {
    try {
      const product = await this.getProductById(productId);
      
      return {
        available: product.quantity >= quantity,
        stock: product.quantity,
        requested: quantity
      };
    } catch (error) {
      logger.error('Error checking product stock:', error);
      throw error;
    }
  }
}

module.exports = new ProductService();