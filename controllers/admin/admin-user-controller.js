// controllers/admin/admin-user-controller.js
const adminService = require("../../services/adminService");
const { AppError } = require("../../utils/errorHandler");
const { HTTP_STATUS } = require("../../config/constants");

class AdminUserController {
  /**
   * Render users management page
   */
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const status = req.query.status || "all";

      const { users, pagination } = await adminService.getUsers(
        page,
        10,
        search,
        status
      );
      const userStats = await adminService.getUserStats();

      res.render("admin/users", {
        title: "Users Management",
        user: req.user,
        users,
        pagination,
        userStats,
        currentSearch: search,
        currentStatus: status,
      });
    } catch (error) {
      console.error("Users page error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("error", {
        title: "Users Error",
        message: "Unable to load users page",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  /**
   * API endpoint to toggle user status
   */
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const result = await adminService.toggleUserStatus(userId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to get user details
   */
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      const user = await adminService.getUserById(userId);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AdminUserController();
