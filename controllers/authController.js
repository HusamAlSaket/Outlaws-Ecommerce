const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show registration form
exports.getRegister = (req, res) => {
  res.render('auth/register'); // views/auth/register.ejs
};

// Handle user registration
exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists by email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.send("❌ Email already registered.");
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.send("❌ Username already taken. Please choose a different username.");
    }

    // Create new user (password will be hashed automatically by pre-save middleware)
    const newUser = new User({
      username,
      email,
      password, // Don't hash here - let the model's pre-save middleware handle it
    });

    await newUser.save();

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };

    res.redirect('/'); // or homepage or dashboard
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      if (err.keyPattern.email) {
        return res.send("❌ Email already registered.");
      }
      if (err.keyPattern.username) {
        return res.send("❌ Username already taken. Please choose a different username.");
      }
    }
    
    res.status(500).send('Registration failed');
  }
};

// Show login form
exports.getLogin = (req, res) => {
  res.render('auth/login'); // Make sure you have views/auth/login.ejs
};

// Handle user login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send("❌ Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send("❌ Incorrect password.");
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// Show profile page
exports.getProfile = (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('profile', { user: req.session.user });
};
