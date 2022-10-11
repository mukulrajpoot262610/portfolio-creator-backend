const router = require("express").Router();
const authController = require("../controllers/auth-controller");
const authMiddleware = require("../middlewares/auth-middleware");

// AUTH
router.post("/api/register", authController.registerUser);
router.post("/api/send-link", authController.sendVerificationLink);
router.post("/api/reset-password", authController.resetPassword);
router.post("/api/forget-password", authController.forgetPassword);
router.post("/api/login", authController.loginUser);
router.get("/api/refresh", authController.refresh);
router.post("/api/logout", authMiddleware, authController.logout);

module.exports = router;