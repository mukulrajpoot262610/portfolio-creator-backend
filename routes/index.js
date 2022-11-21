const router = require("express").Router();
const authController = require("../controllers/auth-controller");
const userController = require("../controllers/user-controller");
const authMiddleware = require("../middlewares/auth-middleware");

// AUTH
router.post("/api/send-link", authController.sendVerificationLink);
router.post("/api/register", authController.registerUser);
router.post("/api/login", authController.loginUser);
router.post("/api/forget-password", authController.forgetPassword);
router.post("/api/reset-password", authController.resetPassword);
router.get("/api/refresh", authController.refresh);
router.post("/api/logout", authMiddleware, authController.logout);
router.get("/api/get-user-details", authMiddleware, authController.getUserDetails);

// DOMAIN
router.post("/api/check-domain", authMiddleware, userController.checkDomain)
router.post("/api/create-website", authMiddleware, userController.buildPortfolio)
router.get("/api/get-all-domains", authMiddleware, userController.getAllPortfolios)
router.post("/api/get-domain", userController.getPortfolio)

module.exports = router;