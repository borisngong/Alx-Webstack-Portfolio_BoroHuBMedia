const express = require("express");
const MemberController = require("../controllers/authSessionControllers");

const router = express.Router();

// Member Auth Route
router.post("/initializeAccount", (req, res) => {
  MemberController.initializeAccount(req, res);
});
router.post("/accessAccount", (req, res) => {
  MemberController.accessAccount(req, res);
});
router.get("/endSession", (req, res) => {
  MemberController.endSession(req, res);
});
router.get("/getUserSession", (req, res) => {
  MemberController.getUserSession(req, res);
});

module.exports = router;
