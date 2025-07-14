const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show registration form
exports.getRegister = (req, res) => {
  res.render('auth/register'); // views/auth/register.ejs
};

// Handle user registration
exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("❌ Email already registered.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    res.redirect('/profile'); // or homepage or dashboard
  } catch (err) {
    console.error(err);
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
      name: user.name,
      email: user.email
    };

    res.redirect('/profile');
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
