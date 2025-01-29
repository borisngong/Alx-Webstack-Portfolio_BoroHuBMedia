const mongoose = require('mongoose');
const Comment = require('../coreModels/feedbackComment');
const Content = require('../coreModels/contentPost');
const { BDERROR } = require('../middlewares/handleErrors');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');

class FeedbackCommentController {
  /**
   *   Creates a new comment on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async createComment(req, res, next) {
    const { postId, input } = req.body;
    const memberId = req.member._id;

    try {
      if (!input || input.trim() === '') {
        throw new BDERROR('Comment input is required', 400);
      }

      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }

      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Post not found', 404);
      }

      const newComment = new Comment({
        member: memberId,
        contentPost: postId,
        input,
      });

      await newComment.save();
      post.comments.push(newComment._id);
      await post.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Comment created successfully!',
          comment: newComment,
        },
        201,
      );
    } catch (error) {
      console.error('Error creating comment:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Updates a comment on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async updateComment(req, res, next) {
    const { commentId } = req.params;
    const { input } = req.body;
    const memberId = req.member._id;

    try {
      if (!input || input.trim() === '') {
        throw new BDERROR('Comment input cannot be empty', 400);
      }

      // Validate commentId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new BDERROR('Invalid comment ID format', 400);
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      if (comment.member.toString() !== memberId.toString()) {
        throw new BDERROR('You are not authorized to update this comment', 403);
      }

      comment.input = input;
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Comment updated successfully!',
        comment,
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Creates a reply to a comment on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async createCommentReply(req, res, next) {
    const { commentId, input } = req.body;
    const memberId = req.member._id;

    try {
      if (!input || input.trim() === '') {
        throw new BDERROR('Reply input is required', 400);
      }

      // Validate commentId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new BDERROR('Invalid comment ID format', 400);
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      const newReply = { member: memberId, input, likes: [] };
      comment.replies.push(newReply);
      await comment.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Reply created successfully!',
          reply: newReply,
        },
        201,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  like a comment reply on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async likeCommentReply(req, res, next) {
    const { replyId } = req.params;
    const memberId = req.member._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(replyId)) {
        throw new BDERROR('Invalid reply ID format', 400);
      }
      const comment = await Comment.findOne({ 'replies._id': replyId });
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        throw new BDERROR('Reply not found', 404);
      }

      if (reply.likes.includes(memberId)) {
        throw new BDERROR('You have already liked this reply', 400);
      }

      reply.likes.push(memberId);
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Reply liked successfully!',
        reply,
      });
    } catch (error) {
      console.error('Error liking reply:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Dislike a comment reply on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async dislikeCommentReply(req, res, next) {
    const { replyId } = req.params;
    const memberId = req.member._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(replyId)) {
        throw new BDERROR('Invalid reply ID format', 400);
      }
      const comment = await Comment.findOne({ 'replies._id': replyId });
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        throw new BDERROR('Reply not found', 404);
      }

      if (!reply.likes.includes(memberId)) {
        throw new BDERROR('You have not liked this reply', 400);
      }

      reply.likes = reply.likes.filter(
        (id) => id.toString() !== memberId.toString(),
      );
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Reply disliked successfully!',
        reply,
      });
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Like a comment on a post content
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async likeCommentController(req, res, next) {
    const { commentId } = req.params;
    const memberId = req.member._id;

    try {
      // Validate commentId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new BDERROR('Invalid comment ID format', 400);
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      if (comment.likes.includes(memberId)) {
        throw new BDERROR('You have already liked this comment', 400);
      }

      comment.likes.push(memberId);
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Comment liked successfully!',
        comment,
      });
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Dislike a comment on a post content
   * @param {*} req  - The request object
   * @param {*} res   - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async dislikeCommentController(req, res, next) {
    const { commentId } = req.params;
    const memberId = req.member._id;

    try {
      // Validate commentId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new BDERROR('Invalid comment ID format', 400);
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      if (!comment.likes.includes(memberId)) {
        throw new BDERROR('You have not liked this comment', 400);
      }

      comment.likes = comment.likes.filter(
        (id) => id.toString() !== memberId.toString(),
      );
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Comment disliked successfully!',
        comment,
      });
    } catch (error) {
      console.error('Error disliking comment:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Deletes a comment on a post content and its replies
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async deleteCommentController(req, res, next) {
    const { commentId } = req.params;
    const memberId = req.member._id;
    const memberRole = req.member.role;

    try {
      // Validate commentId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new BDERROR('Invalid comment ID format', 400);
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      if (
        comment.member.toString() !== memberId.toString()
        && memberRole !== 'admin'
      ) {
        throw new BDERROR('You are not authorized to delete this comment', 403);
      }

      await Content.updateMany(
        { comments: commentId },
        { $pull: { comments: commentId } },
      );

      await Comment.deleteMany({
        _id: { $in: comment.replies.map((reply) => reply._id) },
      });

      await Comment.updateMany(
        { 'replies._id': commentId },
        { $pull: { replies: { _id: commentId } } },
      );

      await Comment.findByIdAndDelete(commentId);

      return sendSuccessResponse(
        res,
        {
          message: 'Comment deleted successfully!',
        },
        204,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = FeedbackCommentController;
