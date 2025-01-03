const express = require("express");
const MemberController = require("../controllers/memberControllers");
const { authenticateToken, isAdmin } = require("../middlewares/authIsAdmin");
const resources = require("../middlewares/mediaUploads");

const router = express.Router();

// Delete member with admin privileges
router.delete("/delete/:memberId", authenticateToken, isAdmin, (req, res) => {
  MemberController.adminDeleteMember(req, res);
});

// Get member details
router.get("/:memberId", (req, res) => {
  MemberController.getMember(req, res);
});

// Update member details
router.put("/update/:memberId", (req, res) => {
  MemberController.updateMember(req, res);
});
// delete member details
router.delete("/delete/:memberId", (req, res) => {
  MemberController.deleteMember(req, res);
});
// follow member
router.put("/follow/:memberId", (req, res) => {
  MemberController.followMember(req, res);
});

// Unfollow member
router.delete("/unfollow/:memberId", (req, res) => {
  MemberController.unfollowMember(req, res);
});

// Get followers list
router.get("/followers/:memberId", (req, res) => {
  MemberController.getFollowersList(req, res);
});

// Restrict user route
router.post("/restricted/:memberId", (req, res) => {
  MemberController.restrictedMember(req, res);
});

// unrestricted user route
router.delete("/unrestricted/:memberId", (req, res) => {
  MemberController.unrestrictedMember(req, res);
});
// Get blocking list
router.get("/restricting/:memberId", (req, res) => {
  MemberController.getRestrictedList(req, res);
});

// Delete member
router.delete("/delete/:memberId", (req, res) => {
  MemberController.deleteMember(req, res);
});
// admin delete member
router.delete("/admin/delete/:memberId", (req, res) => {
  MemberController.adminDeleteMember(req, res);
});
// serach user by member id
router.get("/reserche/:handle", (req, res) => {
  MemberController.searchMember(req, res);
});
// update member profile picture
router.put(
  "/avatarUpload/:memberId",
  resources.single("avatar"),
  (req, res) => {
    MemberController.createAvatarController(req, res);
  }
);

// update member cover picture
router.put(
  "/coverImageUpload/:memberId",
  resources.single("coverImage"),
  (req, res) => {
    MemberController.createCoverImageController(req, res);
  }
);

module.exports = router;
