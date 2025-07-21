const User = require("../../models/User");
const PasswordService = require("./PasswordService");
const TokenService = require("./TokenService");
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

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // Create and save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Return user data (without password)
    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    return userToReturn;
  }

  static async loginUser(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await PasswordService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
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
