const bcrypt = require("bcryptjs");

class PasswordService {
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  static async comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static validatePasswordStrength(password) {
    // at least 8 chars, contain numbers and letters
    const isStrongPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

    if (!isStrongPassword) {
      return "Password must be at least 8 characters and contain uppercase, lowercase letters and numbers";
    }

    return null;
  }
}
module.exports = PasswordService;
