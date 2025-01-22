const express = require('express');
const resource = require('../middlewares/mediaUploads');
const { authenticateToken } = require('../middlewares/authIsAdmin');

const router = express.Router();

const ContentPostController = require('../controllers/contentPostController');

// Content Post Routes

router.post(
  '/create-content-images/:memberId',
  authenticateToken,
  resource.array('media', 4),
  (req, res) => {
    ContentPostController.createContentPost(req, res);
  },
);

// Route to update content
router.put(
  '/update-content/:postId',
  authenticateToken,
  resource.array('media'),
  (req, res) => {
    ContentPostController.updateContentPost(req, res);
  },
);

router.get('/get-member-content/:memberId', authenticateToken, (req, res) => {
  ContentPostController.getAllMemberPosts(req, res);
});

// Retrieve specific content post
router.get('/get-content/:postId', authenticateToken, (req, res) => ContentPostController.getContentPost(req, res));

router.put('/like-content/:postId', authenticateToken, (req, res) => {
  ContentPostController.likeContentPost(req, res);
});

router.put('/unlike-content/:postId', authenticateToken, (req, res) => {
  ContentPostController.unlikeContentPost(req, res);
});
router.delete('/delete-content/:postId', authenticateToken, (req, res) => {
  ContentPostController.deleteContentPost(req, res);
});

module.exports = router;
