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

      return revenueResult.length > 0 ? revenueResult[0].total : 0;
    } catch (error) {
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
}

module.exports = new AdminService();
