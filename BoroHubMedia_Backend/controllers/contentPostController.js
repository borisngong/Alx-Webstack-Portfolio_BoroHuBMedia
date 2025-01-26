const { BDERROR } = require("../middlewares/handleErrors");
const Content = require("../coreModels/contentPost");
const Comment = require("../coreModels/feedbackComment");
const Member = require("../coreModels/memberSchema");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../coreUtils/_bd_responseHandlers");
const { sanitizeMemberData } = require("../coreUtils/sanitized");
const { createFileUrl } = require("../coreUtils/create-fileUrl");

class ContentPostController {
  /**
   * Create a new content post with media
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async createContentPost(req, res) {
    const { content } = req.body; // Content (text) from the request body
    const memberId = req.member._id; // Member ID from authenticated member
    const files = req.files || []; // Uploaded files (media)

    try {
      if (!content) throw new BDERROR("Content is required", 400);
      if (!files.length)
        throw new BDERROR("Please upload at least one media file", 400);

      // Fetch the member who is creating the post
      const member = await Member.findById(memberId);
      if (!member) throw new BDERROR("Member not found", 404);

      // Generate media URLs from uploaded files
      const mediaUrls = files.map((file) => createFileUrl(file.filename));

      // Create a new content post document
      const newContent = new Content({
        author: memberId,
        content,
        media: mediaUrls,
      });

      // Save the new post and update the member's post list
      const savedPost = await newContent.save();
      member.contentPosts = [...(member.contentPosts || []), savedPost._id];
      await member.save();

      // Send success response with the new post and sanitized member data
      return sendSuccessResponse(
        res,
        {
          message: "Post created successfully!",
          post: savedPost,
          member: sanitizeMemberData(member),
        },
        201
      );
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update an existing content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async updateContentPost(req, res) {
    const { postId } = req.params;
    const { content } = req.body;
    const files = req.files || [];
    const memberId = req.member._id;

    try {
      // Fetch the post to update
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR("Post not found", 404);
      if (post.author.toString() !== memberId) {
        throw new BDERROR(
          "Unauthorized: You can only update your own posts",
          403
        );
      }

      // Update the content if provided
      if (content) post.content = content.trim() || post.content;

      // Validate and update media files if provided
      if (files.length > 0) {
        if (files.length < 4)
          throw new BDERROR("Please upload at least four images", 400);
        if (files.length > 8) {
          throw new BDERROR(
            "File upload limit exceeded. Only 10 files are allowed.",
            400
          );
        }

        const mediaUrls = files.map((file) => createFileUrl(file.filename));
        // Add new media URLs to existing media URLs
        post.media = [...post.media, ...mediaUrls];
      }

      const updatedPost = await post.save();
      return sendSuccessResponse(
        res,
        { message: "Content updated successfully!", post: updatedPost },
        200
      );
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Like a content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async likeContentPost(req, res) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Fetch the post to like
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR("Post not found", 404);
      if (post.likes.includes(memberId))
        throw new BDERROR("You have already liked this post", 400);

      post.likes.push(memberId);
      post.likeCount += 1; // Increment like count

      await post.save();
      return sendSuccessResponse(
        res,
        { message: "Post liked successfully!", post },
        200
      );
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Unlike a content post
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async unlikeContentPost(req, res) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Fetch the post to unlike
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR("Post not found", 404);
      if (!post.likes.includes(memberId))
        throw new BDERROR("You have not liked this post yet", 400);
      // Remove member ID from likes
      post.likes = post.likes.filter((id) => id.toString() !== memberId);
      post.likeCount -= 1; // Decrement like count

      await post.save();
      return sendSuccessResponse(
        res,
        { message: "Post unliked successfully!", post },
        200
      );
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete a content post and associated comments
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async deleteContentPost(req, res) {
    const { postId } = req.params;
    const memberId = req.member._id;

    try {
      // Fetch the post to delete
      const post = await Content.findById(postId);
      if (!post) throw new BDERROR("Post not found", 404);

      const member = await Member.findById(memberId);
      if (!member) throw new BDERROR("Member not found", 404);

      // Check ownership or admin role
      if (post.author.toString() !== memberId && member.role !== "admin") {
        throw new BDERROR("Unauthorized: You cannot delete this post", 403);
      }

      // Delete associated comments
      await Comment.deleteMany({ _id: { $in: post.comments } });

      // Update members who liked the post
      await Member.updateMany(
        { _id: { $in: post.likes } },
        { $pull: { likes: postId } }
      );

      // Remove post reference from the author's post list
      await Member.updateOne({ _id: memberId }, { $pull: { posts: postId } });

      await Content.findByIdAndDelete(postId);

      return sendSuccessResponse(
        res,
        { message: "Post deleted successfully!" },
        204
      );
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Retrieve a member's post by ID
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async getContentPost(req, res) {
    const { postId } = req.params;

    try {
      // Fetch the post by ID
      const post = await Content.findById(postId).populate("author", "handle");
      if (!post) throw new BDERROR("Post not found", 404);

      return sendSuccessResponse(res, {
        message: "Post retrieved successfully!",
        post,
      });
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Retrieve all posts of a specific member
   * @param {express.Request} req - The request object
   * @param {express.Response} res - The response object
   */
  static async getAllMemberPosts(req, res) {
    const { memberId } = req.params;

    try {
      // Fetch all posts by the member ID
      const posts = await Content.find({ author: memberId }).populate(
        "author",
        "handle"
      );
      if (!posts.length)
        throw new BDERROR("No posts found for this member", 404);

      return sendSuccessResponse(res, {
        message: "Posts retrieved successfully!",
        posts,
      });
    } catch (error) {
      return sendErrorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = ContentPostController;
