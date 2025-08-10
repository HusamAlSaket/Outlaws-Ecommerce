// controllers/admin/admin-dashboard-controller.js
const adminService = require("../../services/adminService");
const { AppError } = require("../../utils/errorHandler");
const { HTTP_STATUS } = require("../../config/constants");

class AdminDashboardController {
  /**
   * Render admin dashboard with stats and recent orders
   */
  async getDashboard(req, res) {
    try {
      const { stats, recentOrders } = await adminService.getDashboardData();

      res.render("admin/dashboard", {
        title: "Admin Dashboard",
        user: req.user,
        stats,
        recentOrders,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("error", {
        title: "Dashboard Error",
        message: "Unable to load dashboard",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  /**
   * API endpoint for orders chart data
   */
  async getOrdersChartData(req, res) {
    try {
      const chartData = await adminService.getOrdersChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching orders chart data:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: "Failed to fetch chart data",
        message: error.message,
      });
    }
  }

  /**
   * API endpoint for revenue chart data
   */
  async getRevenueChartData(req, res) {
    try {
      const chartData = await adminService.getRevenueChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching revenue chart data:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: "Failed to fetch chart data",
        message: error.message,
      });
    }
  }
}

module.exports = new AdminDashboardController();
