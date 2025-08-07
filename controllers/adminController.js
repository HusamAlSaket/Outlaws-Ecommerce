// controllers/adminController.js
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getDashboard = async (req, res) => {
  try {
    // Get dashboard statistics
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: req.user,
      stats: {
        totalUsers,
        totalProducts, 
        totalOrders,
        totalRevenue
      },
      recentOrders
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Dashboard Error: " + error.message);
  }
};

// API endpoint for chart data
exports.getOrdersChartData = async (req, res) => {
  try {
    // Get orders data for the last 12 months
    const months = [];
    const orderCounts = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await Order.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lte: monthEnd
        }
      });
      
      months.push(date.toLocaleString('default', { month: 'short' }));
      orderCounts.push(count);
    }
    
    res.json({
      labels: months,
      values: orderCounts
    });
  } catch (error) {
    console.error('Error fetching orders chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

exports.getRevenueChartData = async (req, res) => {
  try {
    // Get revenue data by payment status and categories
    const paidOrders = await Order.find({ isPaid: true });
    const unpaidOrders = await Order.find({ isPaid: false });
    
    const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const unpaidRevenue = unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // You can categorize by product categories later
    const labels = ['Paid Orders', 'Unpaid Orders'];
    const values = [paidRevenue, unpaidRevenue];
    
    // Add other categories if you have them
    if (paidRevenue === 0 && unpaidRevenue === 0) {
      labels.push('No Revenue');
      values.push(1); // Just to show something in the chart
    }
    
    res.json({
      labels,
      values
    });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};