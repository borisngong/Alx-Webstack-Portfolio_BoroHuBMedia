const express = require('express');

const feedbackCommentController = require('../controllers/feedbackCommentController');

const router = express.Router();

// create comment feedback route
router.post('/create-comment', (req, res) => {
  feedbackCommentController.createComment(req, res);
});

// update comment feedback route
router.put('/update-comment/:commentId', (req, res) => {
  feedbackCommentController.updateComment(req, res);
});
// comment reply route
router.post('/comment-reply', (req, res) => {
  feedbackCommentController.createCommentReply(req, res);
});

// like comment reply route
router.put('/like-comment-reply/:replyId', (req, res) => {
  feedbackCommentController.likeCommentReply(req, res);
});
// Comment likes route
router.put('/like-comment/:commentId', (req, res) => {
  feedbackCommentController.likeCommentController(req, res);
});
// Comment dislikes route
router.put('/dislike-comment/:commentId', (req, res) => {
  feedbackCommentController.dislikeCommentController(req, res);
});

// comment delete route with likes and replies
router.delete('/delete-comment/:commentId', (req, res) => {
  feedbackCommentController.deleteCommentController(req, res);
});

module.exports = router;
