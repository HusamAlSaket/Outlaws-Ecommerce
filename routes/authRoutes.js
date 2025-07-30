const express = require("express");
const router = express.Router();
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getProfile,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators/authValidator");

const upload = require("../middleware/upload");
const User = require("../models/User");

// Routes for user update
router.post(
  "/profile",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const { username, email } = req.body;
    const updateData = { username, email };
    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }
    // Use session user id for update
    await User.findByIdAndUpdate(req.session.user._id, updateData);
    res.redirect("/profile");
  }
);

router.get("/register", getRegister);
router.post("/register", registerValidation, postRegister);

router.get("/login", getLogin);
router.post("/login", loginValidation, postLogin);

router.get("/profile", requireAuth, getProfile);
router.get("/logout", logout);

// DEBUG ONLY - Remove in production
router.get("/debug/create-test-user", async (req, res) => {
  try {
    const testEmail = "test@example.com";
    let testUser = await require("../models/User").findOne({
      email: testEmail,
    });
    if (testUser) {
      return res.send(
        `Test user already exists. Email: ${testEmail}, Password: Test123`
      );
    }
    const userData = {
      username: "TestUser",
      email: testEmail,
      password: "Test123",
    };
    const user = await require("../services/auth/AuthService").registerUser(
      userData
    );
    res.send(
      `Test user created successfully. Email: ${testEmail}, Password: Test123`
    );
  } catch (error) {
    res.status(500).send(`Error creating test user: ${error.message}`);
  }
});

module.exports = router;
