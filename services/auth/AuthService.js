const User = require("../../models/User");
const PasswordService = require("./PasswordService");
const TokenService = require("./TokenService");
const logger = require("../../utils/logger");
const { validationResult } = require("express-validator");

class AuthService {
  static async registerUser(userData) {
    const { username, email, password } = userData;

    // Check if user exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Validate password strength
    const passwordError = PasswordService.validatePasswordStrength(password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // Create and save user (password hashing happens in User model pre-save hook)
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    // Generate tokens, just like in the login flow
    const authToken = TokenService.generateAuthToken(newUser);
    const refreshToken = TokenService.generateRefreshToken(newUser);

    // Return user data (without password) and tokens
    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    return {
      user: userToReturn,
      authToken,
      refreshToken
    };
  }

  static async loginUser(email, password) {

    // Find user
    const user = await User.findOne({ email });
    logger.info(`Login attempt: ${email}, userFound: ${!!user}`);
    if (!user) {
      logger.error(`Login failed: user not found for email ${email}`);
      throw new Error("Invalid email or password");
    }

    // Try multiple methods to compare passwords to ensure compatibility
    let isPasswordValid = false;
    try {
      // Method 1: Using PasswordService
      isPasswordValid = await PasswordService.comparePasswords(password, user.password);
      logger.info(`PasswordService compare: ${isPasswordValid}`);
      // Method 2: Using User model method
      if (!isPasswordValid) {
        isPasswordValid = await user.matchPassword(password);
        logger.info(`User model matchPassword: ${isPasswordValid}`);
      }
      // Method 3: Direct bcryptjs compare as last resort
      if (!isPasswordValid) {
        const bcryptjs = require('bcryptjs');
        isPasswordValid = await bcryptjs.compare(password, user.password);
        logger.info(`Direct bcryptjs compare: ${isPasswordValid}`);
      }
    } catch (err) {
      logger.error(`Password comparison error for email ${email}: ${err.message}`, { error: err.stack });
    }
    if (!isPasswordValid) {
      logger.error(`Login failed: invalid password for email ${email}`);
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const authToken = TokenService.generateAuthToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    // Return user data and tokens
    const userToReturn = user.toObject();
    delete userToReturn.password;

    return {
      user: userToReturn,
      authToken,
      refreshToken,
    };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

module.exports = AuthService;
