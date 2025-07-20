const Product = require('../models/Product');
const {AppError} = require('../utils/errorHandler');
const {HTTP_STATUS, ERROR_MESSAGES} = require('../config/constants');
const logger = require('../utils/logger');

class CartService {
async addToCart(productId, quantity = 1, currentCart = {}) {
  try {
    logger.info('Adding item to cart', { productId, quantity });
    
    // Validate input
    if (!productId) {
      throw new AppError(ERROR_MESSAGES.PRODUCT.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
    }
    
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new AppError('Invalid quantity specified', HTTP_STATUS.BAD_REQUEST);
    }

    // Fetch product with stock info
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if product is in stock
    if (product.quantity <= 0) {
      throw new AppError('Product is out of stock', HTTP_STATUS.BAD_REQUEST);
    }

    // Calculate new cart quantity
    const currentCartQuantity = currentCart[productId] ? currentCart[productId].qty : 0;
    const newQuantity = currentCartQuantity + parsedQuantity;

    // Validate against available stock
    if (newQuantity > product.quantity) {
      const message = currentCartQuantity > 0 
        ? `Only ${product.quantity} items available. You have ${currentCartQuantity} in cart.`
        : `Only ${product.quantity} items available in stock.`;
      throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
    }

    // Update cart
    const updatedCart = { ...currentCart };
    
    if (updatedCart[productId]) {
      updatedCart[productId].qty = newQuantity;
    } else {
      updatedCart[productId] = {
        title: product.title,
        price: product.price,
        image: product.image,
        qty: parsedQuantity,
      };
    }

    return updatedCart;
    
  } catch (error) {
    logger.error('Error adding item to cart', { productId, quantity, error: error.message });
    throw error;
  }
}

removeFromCart(productId, currentCart = {}) {
  try {
    logger.info('Removing item from cart', { productId });
    
    if (!productId) {
      throw new AppError('Product ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedCart = { ...currentCart };
    
    if (updatedCart[productId]) {
      delete updatedCart[productId];
      logger.info('Item removed from cart', { productId });
    } else {
      logger.warn('Attempted to remove non-existent cart item', { productId });
    }

    return updatedCart;
    
  } catch (error) {
    logger.error('Error removing item from cart', { productId, error: error.message });
    throw error;
  }
}

async updateCartItemQuantity(productId, quantity, currentCart = {}) {
  try {
    logger.info('Updating cart item quantity', { productId, quantity });
    
    const parsedQuantity = parseInt(quantity);
    
    // If quantity is 0 or negative, remove item
    if (parsedQuantity <= 0) {
      return this.removeFromCart(productId, currentCart);
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (parsedQuantity > product.quantity) {
      throw new AppError(`Only ${product.quantity} items available in stock.`, HTTP_STATUS.BAD_REQUEST);
    }

    const updatedCart = { ...currentCart };
    
    if (updatedCart[productId]) {
      updatedCart[productId].qty = parsedQuantity;
      logger.info('Cart item quantity updated', { productId, newQty: parsedQuantity });
    } else {
      throw new AppError('Item not found in cart', HTTP_STATUS.BAD_REQUEST);
    }

    return updatedCart;
    
  } catch (error) {
    logger.error('Error updating cart item quantity', { productId, quantity, error: error.message });
    throw error;
  }
}

calculateCartSummary(cart = {}) {
  try {
    const cartItems = Object.entries(cart).map(([productId, item]) => ({
      id: productId,
      title: item.title,
      price: item.price,
      image: item.image,
      qty: item.qty,
      total: item.qty * item.price
    }));

    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return {
      items: cartItems,
      totalAmount,
      totalItems,
      isEmpty: cartItems.length === 0
    };
    
  } catch (error) {
    logger.error('Error calculating cart summary', { error: error.message });
    throw new AppError('Error calculating cart totals', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

clearCart() {
  logger.info('Cart cleared');
  return {};
}
}

module.exports = new CartService();