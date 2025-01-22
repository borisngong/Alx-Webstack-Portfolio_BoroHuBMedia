const express = require("express");
const MemberAuthenticationController = require("../controllers/authSessionControllers");
const { authenticateToken } = require("../middlewares/authIsAdmin");
const { accessLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// Member Auth Routes

// Initialize a new user account
router.post("/initializeAccount", (req, res) => {
  MemberAuthenticationController.initializeAccount(req, res);
});

// Access existing user account (login)
router.post("/accessAccount", accessLimiter, (req, res) => {
  MemberAuthenticationController.accessAccount(req, res);
});

// End user session (logout)
router.get("/endSession", authenticateToken, (req, res) => {
  MemberAuthenticationController.endSession(req, res);
});

// Get current member session information
router.get("/getSession", authenticateToken, (req, res) => {
  MemberAuthenticationController.getMemberSession(req, res);
});

module.exports = router;
