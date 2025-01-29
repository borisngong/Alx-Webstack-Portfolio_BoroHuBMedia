const mongoose = require('mongoose');
const { BDERROR } = require('../middlewares/handleErrors');
const Content = require('../coreModels/contentPost');
const Comment = require('../coreModels/feedbackComment');
const Member = require('../coreModels/memberSchema');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');
const { sanitizeMemberData } = require('../coreUtils/sanitized');
const { createFileUrl } = require('../coreUtils/create-fileUrl');

class ContentPostController {
  /**
   *  Creates a new content post with the specified content and media files
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async createContentPost(req, res, next) {
    const { content } = req.body;
    const memberId = req.member._id;
    const files = req.files || [];

    try {
      if (!content) throw new BDERROR('Content is required', 400);
      if (!files.length) throw new BDERROR('Please upload at least one media file', 400);

      const member = await Member.findById(memberId);
      if (!member) throw new BDERROR('Member not found', 404);

      const mediaUrls = files.map((file) => createFileUrl(file.filename));

      const newContent = new Content({
        author: memberId,
        content,
        media: mediaUrls,
      });

      const savedPost = await newContent.save();
      member.contentPosts = [...(member.contentPosts || []), savedPost._id];
      await member.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Post created successfully!',
          post: savedPost,
          member: sanitizeMemberData(member),
        },
        201,
      );
    } catch (error) {
      console.error('Error creating content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Updates an existing content post with the specified content and media files
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async updateContentPost(req, res, next) {
    const { postId } = req.params;
    const { content } = req.body;
    const files = req.files || [];
    const memberId = req.member._id;

    try {
      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }

      const post = await Content.findById(postId);
      if (!post) throw new BDERROR('Post not found', 404);
      if (post.author.toString() !== memberId) {
        throw new BDERROR(
          'Unauthorized: You can only update your own posts',
          403,
        );
      }

      if (content) post.content = content.trim() || post.content;

      if (files.length > 0) {
        if (files.length < 4) throw new BDERROR('Please upload at least four images', 400);
        if (files.length > 8) {
          throw new BDERROR(
            'File upload limit exceeded. Only 10 files are allowed.',
            400,
          );
        }

        const mediaUrls = files.map((file) => createFileUrl(file.filename));
        post.media = [...post.media, ...mediaUrls];
      }

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
      console.error('Error updating content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Adds a like to a content post with the specified postId
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async likeContentPost(req, res, next) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }
      // Check if post exists
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR('Post not found', 404);
      if (post.likes.includes(memberId)) throw new BDERROR('You have already liked this post', 400);
      // Add memberId to the likes array and increment likeCount
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
      console.error('Error liking content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Removes a like from a content post with the specified input
   * @param {*} req  - The request object
   * @param {*} res   - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async unlikeContentPost(req, res, next) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }
      // Check if post exists
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR('Post not found', 404);

      // Check if memberId is in the likes array
      const hasLiked = post.likes.some(
        (id) => id.toString() === memberId.toString(),
      );
      if (!hasLiked) {
        throw new BDERROR('You have not liked this post yet', 400);
      }

      // Remove the memberId from the likes array
      post.likes = post.likes.filter(
        (id) => id.toString() !== memberId.toString(),
      );
      post.likeCount = Math.max(0, post.likeCount - 1);
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
      console.error('Error unliking content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Delete a content post with the specified postId and its comments
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next - The next middleware function
   * @returns
   */
  static async deleteContentPost(req, res, next) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }

      const post = await Content.findById(postId);
      if (!post) throw new BDERROR('Post not found', 404);
      const member = await Member.findById(memberId);
      if (!member) throw new BDERROR('Member not found', 404);

      if (post.author.toString() !== memberId && member.role !== 'admin') {
        throw new BDERROR('Unauthorized: You cannot delete this post', 403);
      }
      // Delete the post and its comments
      await Comment.deleteMany({ _id: { $in: post.comments } });
      await Member.updateMany(
        { _id: { $in: post.likes } },
        { $pull: { likes: postId } },
      );
      // Remove the post from the author's contentPosts array
      await Member.updateOne({ _id: memberId }, { $pull: { posts: postId } });
      await Content.findByIdAndDelete(postId);

      return sendSuccessResponse(
        res,
        {
          message: 'Post deleted successfully!',
        },
        204,
      );
    } catch (error) {
      console.error('Error deleting content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Find and retrieves a content post with the specified postId
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next   - The next middleware function
   * @returns
   */
  static async getContentPost(req, res, next) {
    const { postId } = req.params;

    try {
      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new BDERROR('Invalid post ID format', 400);
      }

      const post = await Content.findById(postId).populate('author', 'handle');
      if (!post) throw new BDERROR('Post not found', 404);

      return sendSuccessResponse(res, {
        message: 'Post retrieved successfully!',
        post,
      });
    } catch (error) {
      console.error('Error retrieving content post:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Find and retrieves all member content posts in the database
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getAllMemberPosts(req, res, next) {
    const { memberId } = req.params;

    try {
      // Validate memberId format
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID format', 400);
      }

      const posts = await Content.find({ author: memberId }).populate(
        'author',
        'handle',
      );
      if (!posts.length) throw new BDERROR('No posts found for this member', 404);

      return sendSuccessResponse(res, {
        message: 'Posts retrieved successfully!',
        posts,
      });
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = ContentPostController;
