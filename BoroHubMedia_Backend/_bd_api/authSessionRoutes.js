const express = require('express');
const MemberAuthenticationController = require('../controllers/authSessionControllers');
const { authenticateToken } = require('../middlewares/authIsAdmin');
const { accessLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Member Auth Route
router.post('/initializeAccount', (req, res) => {
  MemberAuthenticationController.initializeAccount(req, res);
});
router.post('/accessAccount', accessLimiter, (req, res) => {
  MemberAuthenticationController.accessAccount(req, res);
});
router.get('/endSession', authenticateToken, (req, res) => {
  MemberAuthenticationController.endSession(req, res);
});
router.get('/getMemberSession', authenticateToken, (req, res) => {
  MemberAuthenticationController.getMemberSession(req, res);
});

module.exports = router;
