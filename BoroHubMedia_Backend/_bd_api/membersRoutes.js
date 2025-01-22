const express = require('express');
const MemberController = require('../controllers/memberControllers');
const { authenticateToken, isAdmin } = require('../middlewares/authIsAdmin');
const resources = require('../middlewares/mediaUploads');

const router = express.Router();

// refresh token
router.post('/refresh-token', authenticateToken, (req, res) => {
  MemberController.refreshAccessToken(req, res);
});
// Delete a member with admin privileges
router.delete('/delete/:memberId', authenticateToken, isAdmin, (req, res) => {
  MemberController.adminDeleteMember(req, res);
});

// Retrieve a member's details
router.get('/:memberId', authenticateToken, (req, res) => {
  MemberController.getMember(req, res);
});

// Update a member's details
router.put('/update/:memberId', authenticateToken, (req, res) => {
  MemberController.updateMember(req, res);
});

// Follow a member
router.put('/follow/:memberId', authenticateToken, (req, res) => {
  MemberController.followMember(req, res);
});

// Unfollow a member
router.delete('/unfollow/:memberId', authenticateToken, (req, res) => {
  MemberController.unfollowMember(req, res);
});

// Get a list of followers
router.get('/followers/:memberId', authenticateToken, (req, res) => {
  MemberController.getFollowersList(req, res);
});

// Restrict a user
router.post('/restricted/', authenticateToken, (req, res) => {
  MemberController.restrictedMember(req, res);
});

// Unrestrict a user
router.delete('/unrestricted/', authenticateToken, (req, res) => {
  MemberController.unrestrictedMember(req, res);
});

// Get a list of blocked users
router.get(
  '/restricted-list/:memberId',
  authenticateToken,
  isAdmin,
  (req, res) => {
    MemberController.getRestrictedList(req, res);
  },
);

// Delete a member
router.delete('/delete/:memberId', authenticateToken, (req, res) => {
  MemberController.deleteMember(req, res);
});

// Admin delete a member
router.delete('/admin/delete/:memberId', authenticateToken, (req, res) => {
  MemberController.adminDeleteMember(req, res);
});

// Search for a user by handle
router.get('/reserche/:handle', (req, res) => {
  MemberController.searchMember(req, res);
});

// Update a member's profile picture
router.post(
  '/avatarUpload/',
  authenticateToken,
  resources.single('avatar'),
  (req, res) => {
    MemberController.createAvatarController(req, res);
  },
);

// Update a member's cover picture
router.put(
  '/coverImageUpload/',
  authenticateToken,
  resources.single('coverImage'),
  (req, res) => {
    MemberController.createCoverImageController(req, res);
  },
);

module.exports = router;
