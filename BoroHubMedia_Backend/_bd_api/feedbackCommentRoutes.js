const express = require('express');
const { authenticateToken } = require('../middlewares/authIsAdmin');

const feedbackCommentController = require('../controllers/feedbackCommentController');

const router = express.Router();

// create comment feedback route
router.post('/create-comment/', authenticateToken, (req, res) => {
  feedbackCommentController.createComment(req, res);
});

// update comment feedback route
router.put('/update-comment/:commentId', authenticateToken, (req, res) => {
  feedbackCommentController.updateComment(req, res);
});
// comment reply route
router.post('/comment-reply', authenticateToken, (req, res) => {
  feedbackCommentController.createCommentReply(req, res);
});

// like comment reply route
router.put('/like-comment-reply/:replyId', authenticateToken, (req, res) => {
  feedbackCommentController.likeCommentReply(req, res);
});
router.put('/dislike-comment-reply/:replyId', authenticateToken, (req, res) => {
  feedbackCommentController.dislikeCommentReply(req, res);
});
// Comment likes route
router.put('/like-comment/:commentId', authenticateToken, (req, res) => {
  feedbackCommentController.likeCommentController(req, res);
});
// Comment dislikes route
router.put('/unlike-comment/:commentId', authenticateToken, (req, res) => {
  feedbackCommentController.dislikeCommentController(req, res);
});

// comment delete route with likes and replies
router.delete('/delete-comment/:commentId', authenticateToken, (req, res) => {
  feedbackCommentController.deleteCommentController(req, res);
});

module.exports = router;
