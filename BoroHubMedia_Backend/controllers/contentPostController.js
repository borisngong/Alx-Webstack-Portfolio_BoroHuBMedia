const { BDERROR } = require('../middlewares/handleErrors');
const Content = require('../coreModels/contentPost');
const Comment = require('../coreModels/feedbackComment');
const Member = require('../coreModels/memberSchema');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');
const { sanitizeMemberData } = require('../coreUtils/sanitized');

class ContentPostController {
  /**
   * Responsible for creating a new content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async createContentPost(req, res) {
    const { memberId, content, media } = req.body;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      // Ensure contentPosts is an array
      member.contentPosts = Array.isArray(member.contentPosts)
        ? member.contentPosts
        : [];

      const newContent = new Content({
        author: memberId,
        content,
        media: media || [], // media is optional
      });

      const savedPost = await newContent.save();
      member.contentPosts.push(savedPost._id);
      await member.save();

      // Sanitize member data before sending response
      const sanitizedMember = sanitizeMemberData(member);

      return sendSuccessResponse(
        res,
        {
          message: 'Post created successfully!',
          post: savedPost,
          member: sanitizedMember,
        },
        201,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for updating an existing content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async updateContentPost(req, res) {
    const { postId } = req.params;
    const { content, media } = req.body;
    try {
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Content not found', 404);
      }

      // Update content and media if provided
      post.content = content || post.content;
      post.media = media || post.media;
      const updatedPost = await post.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Content updated successfully!',
          post: updatedPost,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for retrieving content posts by author ID.
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async getContentController(req, res) {
    const { memberId } = req.params;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      const posts = await Content.find({ author: memberId });
      return sendSuccessResponse(
        res,
        {
          message: 'Posts retrieved successfully!',
          posts,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Responsible for liking a content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async likeContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Post not found', 404);
      }

      // Prevent duplicate likes
      if (post.likes.includes(memberId)) {
        return sendErrorResponse(res, 'You have already liked this post.', 400);
      }

      // Add like and update like count
      post.likes.push(memberId);
      post.likeCount += 1;

      await post.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Post liked successfully!',
          post,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Resonsible for unliiking a content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async unlikeContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Post not found', 404);
      }

      // Check if the member has liked the post
      if (!post.likes.includes(memberId)) {
        return sendErrorResponse(res, 'You have not liked this post yet.', 400);
      }

      // Remove like and update like count
      post.likes = post.likes.filter((id) => id.toString() !== memberId);
      post.likeCount -= 1;

      await post.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Post unliked successfully!',
          post,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }

  /**
   * responsible Delete a content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async deleteContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR('Post content not found', 404);
      }

      // Ensure the member is the author
      if (post.author.toString() !== memberId) {
        return sendErrorResponse(
          res,
          'You are not authorized to delete this content',
          403,
        );
      }

      // Delete associated comments and likes
      await Comment.deleteMany({ _id: { $in: post.comments } });
      await Member.updateMany(
        { _id: { $in: post.likes } },
        { $pull: { likes: postId } },
      );

      // Remove post ID from member's posts array
      await Member.updateOne({ _id: memberId }, { $pull: { posts: postId } });

      // Delete the post
      await Content.findByIdAndDelete(postId);

      return sendSuccessResponse(
        res,
        {
          message: 'Content deleted successfully!',
          post,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || 'An error occurred',
        error.statusCode || 500,
      );
    }
  }
}

module.exports = ContentPostController;
