// routes/admin/index.js
const express = require("express");
const router = express.Router();
const {
  requireAuth,
  requireAdmin,
} = require("../../middleware/authMiddleware");

// Import admin route modules
const dashboardRoutes = require("./admin-dashboard-routes");
const userRoutes = require("./admin-user-routes");
const productRoutes = require("./admin-products-routes");
const orderRoutes = require("./admin-order-routes");
const reviewRoutes = require("./admin-review-routes");

// Admin middleware - must be authenticated and admin
router.use(requireAuth);
router.use(requireAdmin);

// Mount route modules
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);

// Redirect root /admin to dashboard
router.get("/", (req, res) => {
  res.redirect("/admin/dashboard");
});

module.exports = router;
