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

    // Create and save user (password hashing happens in User model pre-save hook)
    const newUser = new User({
      username,
      email,
      password,
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
    console.log('Login attempt:', { email, userFound: !!user });
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Debug log the password values
    console.log('Password comparison:', {
      providedPassword: password,
      storedPasswordHash: user.password.substring(0, 10) + '...' // Only log the first 10 chars for security
    });

    // Try multiple methods to compare passwords to ensure compatibility
    let isPasswordValid = false;
    
    try {
      // Method 1: Using PasswordService
      isPasswordValid = await PasswordService.comparePasswords(password, user.password);
      console.log('Method 1 (PasswordService):', isPasswordValid);
      
      // Method 2: Using User model method
      if (!isPasswordValid) {
        isPasswordValid = await user.matchPassword(password);
        console.log('Method 2 (User model):', isPasswordValid);
      }
      
      // Method 3: Direct bcryptjs compare as last resort
      if (!isPasswordValid) {
        const bcryptjs = require('bcryptjs');
        isPasswordValid = await bcryptjs.compare(password, user.password);
        console.log('Method 3 (Direct bcryptjs):', isPasswordValid);
      }
    } catch (err) {
      console.error('Password comparison error:', err);
    }
    
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
