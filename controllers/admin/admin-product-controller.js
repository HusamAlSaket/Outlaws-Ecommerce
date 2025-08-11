// controllers/admin/admin-product-controller.js
const adminService = require("../../services/adminService");
const { AppError } = require("../../utils/errorHandler");
const { HTTP_STATUS } = require("../../config/constants");

class AdminProductController {
  /**
   * Render products management page
   */
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const status = req.query.status || "all";
      const category = req.query.category || "all";

      const { products, pagination } = await adminService.getProducts(
        page,
        10,
        search,
        status,
        category
      );
      const productStats = await adminService.getProductStats();
      const categories = await adminService.getProductCategories();

      res.render("admin/products", {
        title: "Products Management",
        user: req.user,
        products,
        pagination,
        productStats,
        categories,
        currentSearch: search,
        currentStatus: status,
        currentCategory: category,
      });
    } catch (error) {
      console.error("Products page error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("error", {
        title: "Products Error",
        message: "Unable to load products page",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  /**
   * API endpoint to toggle product status
   */
  async toggleProductStatus(req, res) {
    try {
      const { productId } = req.params;
      const result = await adminService.toggleProductStatus(productId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling product status:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to get product details
   */
  async getProductDetails(req, res) {
    try {
      const { productId } = req.params;
      const product = await adminService.getProductById(productId);
      res.json({ success: true, product });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to create a new product
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const result = await adminService.createProduct(productData);
      res.json(result);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to update a product
   */
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;
      const result = await adminService.updateProduct(productId, updateData);
      res.json(result);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * API endpoint to delete a product
   */
  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      const result = await adminService.deleteProduct(productId);
      res.json(result);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AdminProductController();