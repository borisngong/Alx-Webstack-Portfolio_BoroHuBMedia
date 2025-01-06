const express = require('express');
const UserController = require('../controllers/authSessionControllers');

const router = express.Router();

// Member Authentication Routes
router.post('/initializeAccount', (req, res) => {
  UserController.initializeAccount(req, res);
});
router.post('/accessAccount', (req, res) => {
  UserController.accessAccount(req, res);
});
router.get('/endSession', (req, res) => {
  UserController.endSession(req, res);
});
router.get('/getUserSession', (req, res) => {
  UserController.getUserSession(req, res);
});

module.exports = router;
