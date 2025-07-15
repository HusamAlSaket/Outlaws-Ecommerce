const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show registration form
exports.getRegister = (req, res) => {
  res.render('auth/register', { errors: null, oldInput: null });
};
exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;
  const errors = {};

  if (!username || username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!email || !email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return res.render('auth/register', { errors, oldInput: req.body });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      errors.email = "Email already registered.";
      return res.render('auth/register', { errors, oldInput: req.body });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      errors.username = "Username already taken.";
      return res.render('auth/register', { errors, oldInput: req.body });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/register', { errors: { general: "Server error. Please try again." }, oldInput: req.body });
  }
};


// Show login form
exports.getLogin = (req, res) => {
  res.render('auth/login', { errors: null, oldInput: null });
};

// Handle user login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.includes('@')) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  if (Object.keys(errors).length > 0) {
    return res.render('auth/login', { errors, oldInput: req.body });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        errors: { email: "Email not found." },
        oldInput: req.body
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', {
        errors: { password: "Incorrect password." },
        oldInput: req.body
      });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/login', {
      errors: { general: "Server error. Please try again." },
      oldInput: req.body
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// Show profile page
exports.getProfile = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    // Import Order model
    const Order = require('../models/Order');
    
    // Fetch user's orders
    const orders = await Order.find({ user: req.session.user._id })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.render('profile', { 
      user: req.session.user,
      orders: orders 
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.render('profile', { 
      user: req.session.user,
      orders: [] 
    });
  }
};
