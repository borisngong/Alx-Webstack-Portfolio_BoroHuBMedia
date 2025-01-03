const express = require("express");
const { BDERROR } = require("../middlewares/handleErrors");
const Content = require("../coreModels/contentPost");
const Comment = require("../coreModels/feedbackComment");
const Member = require("../coreModels/memberSchema");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../coreUtils/_bd_responseHandlers");
const { sanitizeMemberData } = require("../coreUtils/sanitized");

class ContentPostController {
  static async createContentPost(req, res) {
    const { memberId, content, media } = req.body;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      // Check if contentPosts is defined
      if (!Array.isArray(member.contentPosts)) {
        member.contentPosts = []; // Initialize if undefined
      }

      const newContent = new Content({
        author: memberId,
        content,
        media: media || [], // media is optional
      });

      const savedPost = await newContent.save();
      member.contentPosts.push(savedPost._id);
      await member.save();

      // Sanitize member data
      const sanitizedMember = sanitizeMemberData(member);

      return sendSuccessResponse(
        res,
        {
          message: "Post created successfully!",
          post: savedPost,
          member: sanitizedMember,
        },
        201
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // update post
  static async updateContentPost(req, res) {
    const { postId } = req.params;
    const { content, media } = req.body;
    try {
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR("Content not found", 404);
      }
      post.content = content || post.content;
      post.media = media || post.media;
      const updatedPost = await post.save();
      return sendSuccessResponse(
        res,
        {
          message: "Content updated successfully!",
          post: updatedPost,
        },
        200
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // get member content post by author id
  static async getContentController(req, res) {
    const { memberId } = req.params;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }
      const posts = await Content.find({ author: memberId });
      return sendSuccessResponse(
        res,
        {
          message: "Posts retrieved successfully!",
          posts,
        },
        200
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // like a post
  static async likeContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      // Fetch the member to ensure they exist
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      // Fetch the post to ensure it exists
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR("Post not found", 404);
      }

      // Check if the member has already liked the post
      if (post.likes.includes(memberId)) {
        return sendErrorResponse(res, "You have already liked this post.", 400);
      }

      // Add memberId to post likes and increment the like count
      post.likes.push(memberId);
      post.likeCount += 1; // Increment the like count

      // Save the updated post
      await post.save();

      return sendSuccessResponse(
        res,
        {
          message: "Post liked successfully!",
          post,
        },
        200
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // unlike a post
  static async unlikeContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      // Fetch the member to ensure they exist
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      // Fetch the post to ensure it exists
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR("Post not found", 404);
      }

      // Check if the member has liked the post
      if (!post.likes.includes(memberId)) {
        return sendErrorResponse(res, "You have not liked this post yet.", 400);
      }

      // Remove memberId from post likes and decrement the like count
      post.likes = post.likes.filter((id) => id.toString() !== memberId);
      post.likeCount -= 1;

      // Save the updated post
      await post.save();

      return sendSuccessResponse(
        res,
        {
          message: "Post unliked successfully!",
          post,
        },
        200
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // delete post
  static async deleteContentPostController(req, res) {
    const { postId } = req.params;
    const { memberId } = req.body;

    try {
      // Fetch the post to ensure it exists
      const post = await Content.findById(postId);
      if (!post) {
        throw new BDERROR("Post content not found", 404);
      }

      // Check if the member is the author of the post
      if (post.author.toString() !== memberId) {
        return sendErrorResponse(
          res,
          "You are not authorized to delete this content",
          403
        );
      }

      // Delete comments associated with the post
      await Comment.deleteMany({ _id: { $in: post.comments } });

      // Delete likes associated with the post
      await Member.updateMany(
        { _id: { $in: post.likes } },
        { $pull: { likes: postId } }
      );

      // Remove the postId from the member's posts array
      await Member.updateOne({ _id: memberId }, { $pull: { posts: postId } });

      // Delete the post
      await Content.findByIdAndDelete(postId);

      return sendSuccessResponse(
        res,
        {
          message: "Content deleted successfully!",
          post,
        },
        200
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        error.message || "An error occurred",
        error.statusCode || 500
      );
    }
  }
  // like
}

module.exports = ContentPostController;
