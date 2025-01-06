const express = require('express');
const MemberController = require('../controllers/memberControllers');
const { authenticateToken, isAdmin } = require('../middlewares/authIsAdmin');
const resources = require('../middlewares/mediaUploads');

const router = express.Router();

// Delete a member with admin privileges
router.delete('/delete/:memberId', authenticateToken, isAdmin, (req, res) => {
  MemberController.adminDeleteMember(req, res);
});

// Retrieve a member's details
router.get('/:memberId', (req, res) => {
  MemberController.getMember(req, res);
});

// Update a member's details
router.put('/update/:memberId', (req, res) => {
  MemberController.updateMember(req, res);
});

// Delete a member's details
router.delete('/delete/:memberId', (req, res) => {
  MemberController.deleteMember(req, res);
});

// Follow a member
router.put('/follow/:memberId', (req, res) => {
  MemberController.followMember(req, res);
});

// Unfollow a member
router.delete('/unfollow/:memberId', (req, res) => {
  MemberController.unfollowMember(req, res);
});

// Get a list of followers
router.get('/followers/:memberId', (req, res) => {
  MemberController.getFollowersList(req, res);
});

// Restrict a user
router.post('/restricted/:memberId', (req, res) => {
  MemberController.restrictedMember(req, res);
});

// Unrestrict a user
router.delete('/unrestricted/:memberId', (req, res) => {
  MemberController.unrestrictedMember(req, res);
});

// Get a list of blocked users
router.get('/restricting/:memberId', (req, res) => {
  MemberController.getRestrictedList(req, res);
});

// Delete a member
router.delete('/delete/:memberId', (req, res) => {
  MemberController.deleteMember(req, res);
});

// Admin delete a member
router.delete('/admin/delete/:memberId', (req, res) => {
  MemberController.adminDeleteMember(req, res);
});

// Search for a user by handle
router.get('/reserche/:handle', (req, res) => {
  MemberController.searchMember(req, res);
});

// Update a member's profile picture
router.put(
  '/avatarUpload/:memberId',
  resources.single('avatar'),
  (req, res) => {
    MemberController.createAvatarController(req, res);
  },
);

// Update a member's cover picture
router.put(
  '/coverImageUpload/:memberId',
  resources.single('coverImage'),
  (req, res) => {
    MemberController.createCoverImageController(req, res);
  },
);

module.exports = router;
