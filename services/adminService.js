const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Object} Dashboard stats object
   */
  async getDashboardStats() {
    try {
      const [totalUsers, totalProducts, totalOrders, totalRevenue] =
        await Promise.all([
          User.countDocuments(),
          Product.countDocuments(),
          Order.countDocuments(),
          this.calculateTotalRevenue(),
        ]);

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get recent orders with populated data
   * @param {number} limit - Number of orders to fetch
   * @returns {Array} Array of recent orders
   */
  async getRecentOrders(limit = 5) {
    try {
      return await Order.find()
        .populate("user", "username email")
        .populate("items.productId", "name price")
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }

  /**
   * Calculate total revenue from paid orders
   * @returns {number} Total revenue
   */
  async calculateTotalRevenue() {
    try {
      const revenueResult = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
      
      console.log("💰 Revenue calculated:", totalRevenue);

      return totalRevenue;
    } catch (error) {
      console.error("Revenue calculation error:", error);
      throw new Error(`Failed to calculate revenue: ${error.message}`);
    }
  }

  /**
   * Get orders chart data for the last 12 months
   * @returns {Object} Chart data with labels and values
   */
  async getOrdersChartData() {
    try {
      const months = [];
      const orderCounts = [];

      // Get data for last 12 months
      const promises = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        months.push(date.toLocaleString("default", { month: "short" }));

        promises.push(
          Order.countDocuments({
            createdAt: {
              $gte: monthStart,
              $lte: monthEnd,
            },
          })
        );
      }

      const counts = await Promise.all(promises);

      return {
        labels: months,
        values: counts,
      };
    } catch (error) {
      throw new Error(`Failed to fetch orders chart data: ${error.message}`);
    }
  }

  /**
   * Get revenue chart data by payment status
   * @returns {Object} Chart data with labels and values
   */
  async getRevenueChartData() {
    try {
      const [paidOrders, unpaidOrders] = await Promise.all([
        Order.find({ isPaid: true }),
        Order.find({ isPaid: false }),
      ]);

      const paidRevenue = paidOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const unpaidRevenue = unpaidOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      // Handle empty data case
      if (paidRevenue === 0 && unpaidRevenue === 0) {
        return {
          labels: ["No Revenue Yet"],
          values: [1], // Show something in the chart
        };
      }

      return {
        labels: ["Paid Orders", "Unpaid Orders"],
        values: [paidRevenue, unpaidRevenue],
      };
    } catch (error) {
      throw new Error(`Failed to fetch revenue chart data: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard data
   * @returns {Object} Complete dashboard data
   */
  async getDashboardData() {
    try {
      const [stats, recentOrders] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentOrders(),
      ]);

      return {
        stats,
        recentOrders,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
  }

  /**
   * Get user statistics for dashboard cards
   */
  async getUserStats() {
    try {
      const totalUsers = await User.countDocuments();

      // Count inactive users (explicitly set to false)
      const inactiveUsers = await User.countDocuments({ isActive: false });

      // Calculate active users (total - inactive)
      // This treats legacy users (without isActive field) as active by default
      const activeUsers = totalUsers - inactiveUsers;

      const newThisMonth = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      });

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newThisMonth,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(page = 1, limit = 10, search = "", status = "all") {
    try {
      const skip = (page - 1) * limit;

      // Build query
      let query = {};

      // Search filter
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Status filter
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }

      const users = await User.find(query)
        .select("-password") // Don't return passwords
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.isActive = !user.isActive;
      await user.save();

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }
  // ============ PRODUCT MANAGEMENT METHODS ============

  /**
   * Get product statistics for dashboard cards
   */
  async getProductStats() {
    try {
      const totalProducts = await Product.countDocuments();
      const activeProducts = await Product.countDocuments({ isActive: true });
      const inactiveProducts = totalProducts - activeProducts;

      // Calculate total sold from orders
      const soldResult = await Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: "$items" },
        { $group: { _id: null, totalSold: { $sum: "$items.qty" } } },
      ]);
      const totalSold = soldResult.length > 0 ? soldResult[0].totalSold : 0;

      const newThisMonth = await Product.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      });

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalSold,
        newThisMonth,
      };
    } catch (error) {
      console.error("Error fetching product stats:", error);
      throw error;
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    category = "all"
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build query
      let query = {};

      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      // Status filter
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }

      // Category filter
      if (category && category !== "all") {
        query.category = category;
      }

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      return {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      product.isActive = !product.isActive;
      await product.save();

      return {
        success: true,
        product: {
          id: product._id,
          title: product.title,
          isActive: product.isActive,
        },
      };
    } catch (error) {
      console.error("Error toggling product status:", error);
      throw error;
    }
  }

  /**
   * Get product details by ID
   */
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  /**
   * Get all unique categories for filter dropdown
   */
  async getProductCategories() {
    try {
      const categories = await Product.distinct("category");
      return categories.filter((cat) => cat && cat.trim() !== "");
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Object} Created product result
   */
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return {
        success: true,
        message: "Product created successfully",
        product: product,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Update data
   * @returns {Object} Update result
   */
  async updateProduct(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        message: "Product updated successfully",
        product: product,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Object} Delete result
   */
  async deleteProduct(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // ============ ORDER MANAGEMENT METHODS ============

  /**
   * Get order statistics for dashboard cards
   */
  async getOrderStats() {
    try {
      const totalOrders = await Order.countDocuments();
      const paidOrders = await Order.countDocuments({ isPaid: true });
      const unpaidOrders = totalOrders - paidOrders;
      
      const totalRevenue = await this.calculateTotalRevenue();
      
      const newThisMonth = await Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      });

      console.log("📊 Final stats - Total Revenue:", totalRevenue);

      return {
        totalOrders,
        paidOrders,
        unpaidOrders,
        totalRevenue,
        newThisMonth,
      };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw error;
    }
  }

  /**
   * Get all orders with pagination and filtering
   */
  async getOrders(
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    dateRange = "all"
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build query
      let query = {};

      // Search filter (this is basic - for more advanced search we'd need aggregation)
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "shippingInfo.fullName": { $regex: search, $options: "i" } },
        ];
      }

      // Status filter
      if (status === "paid") {
        query.isPaid = true;
      } else if (status === "unpaid") {
        query.isPaid = false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate) {
          query.createdAt = { $gte: startDate };
        }
      }

      const orders = await Order.find(query)
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Toggle order payment status
   */
  async toggleOrderPaymentStatus(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      order.isPaid = !order.isPaid;
      await order.save();

      return {
        success: true,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          isPaid: order.isPaid,
        },
      };
    } catch (error) {
      console.error("Error toggling order payment status:", error);
      throw error;
    }
  }

  /**
   * Get order details by ID
   */
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("user", "username email image")
        .populate("items.productId", "title price image");
      
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Update order details
   * @param {string} orderId - Order ID
   * @param {Object} updateData - Update data
   * @returns {Object} Update result
   */
  async updateOrder(orderId, updateData) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new Error("Order not found");
      }

      return {
        success: true,
        message: "Order updated successfully",
        order: order,
      };
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Object} Update result
   */
  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new Error("Order not found");
      }

      return {
        success: true,
        message: "Order status updated successfully",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  /**
   * Delete an order
   * @param {string} orderId - Order ID
   * @returns {Object} Delete result
   */
  async deleteOrder(orderId) {
    try {
      const order = await Order.findByIdAndDelete(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      return {
        success: true,
        message: "Order deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }
}
module.exports = new AdminService();
