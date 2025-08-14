// controllers/admin/admin-order-controller.js
const adminService = require("../../services/adminService");
const { AppError } = require("../../utils/errorHandler");
const { HTTP_STATUS } = require("../../config/constants");

class AdminOrderController {
  /**
   * Render orders management page
   */
  async getOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const status = req.query.status || "all";
      const dateRange = req.query.dateRange || "all";

      const { orders, pagination } = await adminService.getOrders(
        page,
        10,
        search,
        status,
        dateRange
      );
      const orderStats = await adminService.getOrderStats();

      res.render("admin/orders", {
        title: "Orders Management",
        user: req.user,
        orders,
        pagination,
        orderStats,
        currentSearch: search,
        currentStatus: status,
        currentDateRange: dateRange,
      });
    } catch (error) {
      console.error("Orders page error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("error", {
        title: "Orders Error",
        message: "Unable to load orders page",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  /**
   * API endpoint to toggle order payment status
   */
  async toggleOrderPaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const result = await adminService.toggleOrderPaymentStatus(orderId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling order payment status:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to get order details
   */
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const order = await adminService.getOrderById(orderId);
      res.json({ success: true, order });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to update an order
   */
  async updateOrder(req, res) {
    try {
      const { orderId } = req.params;
      const updateData = req.body;
      const result = await adminService.updateOrder(orderId, updateData);
      res.json(result);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to delete an order
   */
  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;
      const result = await adminService.deleteOrder(orderId);
      res.json(result);
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AdminOrderController();
