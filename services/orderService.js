const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../utils/errorHandler');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const logger = require('../utils/logger');
const cartService = require('./cartService');

class OrderService {
  // Generate unique order number
  generateOrderNumber() {
    const prefix = 'OUTLAW';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `${prefix}-${date}-${random}`;
  }

  // Validate cart items against current stock
  async validateCartForCheckout(cart) {
    try {
      logger.info('Validating cart for checkout', { itemCount: Object.keys(cart).length });
      
      if (!cart || Object.keys(cart).length === 0) {
        throw new AppError('Cart is empty', HTTP_STATUS.BAD_REQUEST);
      }

      const stockValidation = [];
      
      for (const id in cart) {
        const product = await Product.findById(id);
        if (!product) {
          throw new AppError(`Product not found: ${cart[id].title}`, HTTP_STATUS.NOT_FOUND);
        }
        
        if (product.quantity < cart[id].qty) {
          stockValidation.push({
            title: product.title,
            requested: cart[id].qty,
            available: product.quantity
          });
        }
      }

      if (stockValidation.length > 0) {
        let errorMessage = 'Insufficient stock for the following items:\n';
        stockValidation.forEach(item => {
          errorMessage += `${item.title}: Requested ${item.requested}, Available ${item.available}\n`;
        });
        throw new AppError(errorMessage, HTTP_STATUS.BAD_REQUEST);
      }

      logger.info('Cart validation successful');
      return true;
      
    } catch (error) {
      logger.error('Cart validation failed', { error: error.message });
      throw error;
    }
  }

  // Create new order
  async createOrder(userId, cart, shippingInfo) {
    try {
      logger.info('Creating new order', { userId, itemCount: Object.keys(cart).length });

      // Validate cart first
      await this.validateCartForCheckout(cart);

      // Use cart service to get clean cart data
      const cartSummary = cartService.calculateCartSummary(cart);

      // Prepare order items
      const items = cartSummary.items.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        image: item.image
      }));

      // Create order
      const order = new Order({
        orderNumber: this.generateOrderNumber(),
        user: userId,
        items,
        shippingInfo,
        totalAmount: cartSummary.totalAmount
      });

      const savedOrder = await order.save();
      
      // Update product stock
      await this.updateProductStock(cart);

      logger.info('Order created successfully', { 
        orderNumber: savedOrder.orderNumber,
        totalAmount: savedOrder.totalAmount 
      });

      return savedOrder;
      
    } catch (error) {
      logger.error('Error creating order', { userId, error: error.message });
      throw error;
    }
  }

  // Update product quantities after order
  async updateProductStock(cart) {
    try {
      logger.info('Updating product stock', { itemCount: Object.keys(cart).length });

      for (const id in cart) {
        await Product.findByIdAndUpdate(id, {
          $inc: { quantity: -cart[id].qty }
        });
        logger.info('Stock updated', { productId: id, qty: cart[id].qty });
      }
      
    } catch (error) {
      logger.error('Error updating product stock', { error: error.message });
      throw new AppError('Failed to update product inventory', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get user's orders
  async getUserOrders(userId) {
    try {
      logger.info('Fetching user orders', { userId });

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 }); // Most recent first

      logger.info('Orders retrieved successfully', { 
        userId, 
        orderCount: orders.length 
      });

      return orders;
      
    } catch (error) {
      logger.error('Error fetching user orders', { userId, error: error.message });
      throw new AppError('Failed to fetch orders', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new OrderService();