const Comment = require('../coreModels/feedbackComment');
const Content = require('../coreModels/contentPost');
const Member = require('../coreModels/memberSchema');
const { BDERROR } = require('../middlewares/handleErrors');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');

class FeedbackCommentController {
  /**
   * Responsible for creating a new comment on a post
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async createComment(req, res) {
    const { postId, input } = req.body;
    const memberId = req.member._id;

    try {
      // Validate the comment input
      if (!input || input.trim() === '') {
        throw new BDERROR('Comment input is required', 400);
      }

      // Check if the post exists
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Post not found', 404);
      }

      // Check if the member exists
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      // Create a new comment
      const newComment = new Comment({
        member: memberId,
        contentPost: postId,
        input,
      });

      // Save the comment
      await newComment.save();

      // Update the post's comments array
      post.comments.push(newComment._id);
      await post.save();

      // Send success response
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
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for updating an existing comment
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async updateComment(req, res) {
    const { commentId } = req.params;
    const { input } = req.body;
    const memberId = req.member._id;

    try {
      // Validate the input
      if (!input || input.trim() === '') {
        throw new BDERROR('Comment input cannot be empty', 400);
      }

      // Find the comment by ID
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      // Ensure the member is the author of the comment
      if (comment.member.toString() !== memberId.toString()) {
        return sendErrorResponse(
          res,
          'You are not authorized to update this comment',
          403,
        );
      }

      // Update the comment's input
      comment.input = input;
      await comment.save();

      // Send success response
      return sendSuccessResponse(res, {
        message: 'Comment updated successfully!',
        comment,
      });
    } catch (error) {
      return sendErrorResponse(res, error.statusCode || 500);
    }
  }

  /**
   * Responsible for creating a reply to a comment
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async createCommentReply(req, res) {
    const { commentId, input } = req.body;
    const memberId = req.member._id;

    try {
      // Validate the input
      if (!input || input.trim() === '') {
        throw new BDERROR('Reply input is required', 400);
      }

      // Check if the comment exists
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      // Check if the member exists
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      // Create a new reply
      const newReply = {
        member: memberId,
        input,
        likes: [],
      };

      // Add reply to the comment's replies array
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
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for liking a comment reply
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async likeCommentReply(req, res) {
    const { replyId } = req.params;
    const memberId = req.member._id;

    try {
      // Check if the reply exists
      const comment = await Comment.findOne({ 'replies._id': replyId });
      if (!comment) {
        throw new BDERROR('Reply not found', 404);
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        throw new BDERROR('Reply not found', 404);
      }

      // Check if the member has already liked the reply
      if (reply.likes.includes(memberId)) {
        throw new BDERROR('You have already liked this reply', 400);
      }

      // Add memberId to reply likes
      reply.likes.push(memberId);
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Reply liked successfully!',
        reply,
      });
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for disliking a comment reply
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async dislikeCommentReply(req, res) {
    const { replyId } = req.params;
    const memberId = req.member._id;

    try {
      const comment = await Comment.findOne({ 'replies._id': replyId });
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        throw new BDERROR('Reply not found', 404);
      }

      // Ensure likes is an array before proceeding
      if (!Array.isArray(reply.likes)) {
        throw new BDERROR('Invalid likes array', 500);
      }

      if (!reply.likes.includes(memberId)) {
        throw new BDERROR('You have not liked this reply', 400);
      }

      // Filter out the memberId safely
      reply.likes = reply.likes.filter(
        (id) => id && id.toString() !== memberId.toString(),
      );
      await comment.save();

      return sendSuccessResponse(res, {
        message: 'Reply disliked successfully!',
        reply,
      });
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for liking a comment
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async likeCommentController(req, res) {
    const { commentId } = req.params;
    const memberId = req.member._id;

    try {
      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      // Check if the member has already liked the comment
      if (comment.likes.includes(memberId)) {
        return sendErrorResponse(
          res,
          'You have already liked this comment.',
          400,
        );
      }

      // Add memberId to comment likes
      comment.likes.push(memberId);
      await comment.save();

      // Send success response
      return sendSuccessResponse(res, {
        message: 'Comment liked successfully!',
        comment,
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for disliking a comment
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async dislikeCommentController(req, res) {
    const { commentId } = req.params;
    const memberId = req.member._id;

    try {
      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      // Check if the member has already liked the comment
      if (!comment.likes.includes(memberId)) {
        return sendErrorResponse(res, 'You have not liked this comment.', 400);
      }

      // Remove memberId from comment likes
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== memberId.toString(),
      );
      await comment.save();

      // Send success response
      return sendSuccessResponse(res, {
        message: 'Comment disliked successfully!',
        comment,
      });
    } catch (error) {
      console.error('Error disliking comment:', error);
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for deleting a comment along with its likes and replies
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async deleteCommentController(req, res) {
    const { commentId } = req.params;
    const memberId = req.member._id;
    const memberRole = req.member.role;

    try {
      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new BDERROR('Comment not found', 404);
      }

      // Check if the member is the creator or has the role of 'admin'
      if (
        comment.member.toString() !== memberId.toString()
        && memberRole !== 'admin'
      ) {
        return sendErrorResponse(
          res,
          'You are not authorized to delete this comment.',
          403,
        );
      }

      // Delete the likes from the associated content
      await Content.updateMany(
        { comments: commentId },
        { $pull: { comments: commentId } },
      );

      // Delete the replies
      await Comment.deleteMany({ _id: { $in: comment.replies } });

      // Delete the comment replies from other comments
      await Comment.updateMany(
        { 'replies._id': commentId },
        { $pull: { replies: { _id: commentId } } },
      );

      // Delete the comment
      await Comment.findByIdAndDelete(commentId);

      return sendSuccessResponse(res, {
        message: 'Comment deleted successfully!',
        memberId: comment.member,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }
}

module.exports = FeedbackCommentController;
