const Member = require("../coreModels/memberSchema");
const { BDERROR } = require("../middlewares/handleErrors");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../coreUtils/_bd_responseHandlers");
const { sanitizeMemberData } = require("../coreUtils/sanitized");
const { query } = require("express");
const { createFileUrl } = require("../coreUtils/create-fileUrl");

class MemberController {
  static async getMember(req, res) {
    try {
      const memberId = req.params.memberId;
      const member = await Member.findById(memberId);

      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      const memberData = sanitizeMemberData(member);
      sendSuccessResponse(res, memberData, 200);
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  static async updateMember(req, res) {
    try {
      const memberId = req.params.memberId;
      const editData = req.body;

      // Ensure the method name is correct
      const member = await Member.findByIdAndUpdate(memberId, editData, {
        new: true,
        runValidators: true,
      });

      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      const memberData = sanitizeMemberData(member);
      sendSuccessResponse(res, memberData, 200);
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  //   static async deleteMember(req, res) {}
  static async followMember(req, res) {
    const { memberId } = req.params;
    const { followerId } = req.body;

    try {
      // Find the member to be followed
      const member = await Member.findById(memberId);
      // Check if the follower exists
      const follower = await Member.findById(followerId);

      // check so that member can't follow himself
      if (memberId === followerId) {
        throw new BDERROR("Member cannot follow oneself", 400);
      }

      // Check if both member and follower exist
      if (!member) {
        throw new BDERROR(
          "The member you are trying to follow does not exist",
          404
        );
      }
      if (!follower) {
        throw new BDERROR("The follower ID does not exist", 404);
      }

      // Check if the follower is already following the member
      if (member.connections.followers.includes(followerId)) {
        throw new BDERROR("You are already connected with this member", 400);
      }

      // Update follower and following connections
      member.connections.followers.push(followerId);
      follower.connections.following.push(memberId);

      // Save the updated members to the database
      await member.save();
      await follower.save();

      // Send a success response
      return sendSuccessResponse(
        res,
        {
          message: "You are now connected with this member",
          memberData: sanitizeMemberData(member),
        },

        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  static async unfollowMember(req, res) {
    const { memberId } = req.params;
    const { followerId } = req.body;

    try {
      // Find the member to be unfollowed
      const member = await Member.findById(memberId);
      // Check if the follower exists
      const follower = await Member.findById(followerId);

      // Ensure member and follower are not the same
      if (memberId === followerId) {
        throw new BDERROR("Member cannot unfollow oneself", 400);
      }

      // Check if both member and follower exist
      if (!member) {
        throw new BDERROR(
          "The member you are trying to unfollow does not exist",
          404
        );
      }
      if (!follower) {
        throw new BDERROR("The follower ID does not exist", 404);
      }

      // Check if the follower is actually following the member
      if (!member.connections.followers.includes(followerId)) {
        throw new BDERROR("You are not connected with this member", 400);
      }

      // Remove the follower from the member's followers list
      member.connections.followers = member.connections.followers.filter(
        (id) => id.toString() !== followerId
      );

      // Remove the member from the follower's following list
      follower.connections.following = follower.connections.following.filter(
        (id) => id.toString() !== memberId
      );

      // Save the updated members to the database
      await member.save();
      await follower.save();

      // Send a success response
      return sendSuccessResponse(
        res,
        {
          message: "You have successfully unfollowed this member",
          memberData: sanitizeMemberData(member),
        },
        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  static async restrictedMember(req, res) {
    const { memberId } = req.params;
    const { restrictedUserId } = req.body;

    try {
      // Find the member to be restricted
      const member = await Member.findById(memberId);
      // Check if the restricted user exists
      const restrictedMember = await Member.findById(restrictedUserId);
      if (!restrictedMember) {
        throw new BDERROR("The restricted user ID does not exist", 404);
      }
      // Check if the member exists
      if (!member) {
        throw new BDERROR(
          "The member you are trying to restrict does not exist",
          404
        );
      }
      // Check if the member is trying to restrict themselves
      if (memberId === restrictedUserId) {
        throw new BDERROR("Member cannot restrict oneself", 400);
      }
      // Check if the restricted user is already restricted
      if (member.restrictedUsers.includes(restrictedUserId)) {
        throw new BDERROR("This user is already restricted", 400);
      }
      // Update the member's restricted users list
      member.restrictedUsers.push(restrictedUserId);
      // ubfollow the restricted user
      member.connections.following = member.connections.following.filter(
        (id) => id.toString() !== restrictedUserId
      );
      // unfollowed by the restricted user
      restrictedMember.connections.followers =
        restrictedMember.connections.followers.filter(
          (id) => id.toString() !== memberId
        );
      // Save the updated member to the database
      await member.save();
      // Send a success response
      return sendSuccessResponse(
        res,
        {
          message: "You have successfully restricted this user",
          memberData: sanitizeMemberData(member),
        },
        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  static async unrestrictedMember(req, res) {
    const { memberId } = req.params;
    const { restrictedUserId } = req.body;

    try {
      // Find the member to be unrestricted
      const member = await Member.findById(memberId);
      // Check if the restricted user exists
      const restrictedMember = await Member.findById(restrictedUserId);
      if (!restrictedMember) {
        throw new BDERROR("The restricted user ID does not exist", 404);
      }
      // Check if the member exists
      if (!member) {
        throw new BDERROR(
          "The member you are trying to unrestrict does not exist",
          404
        );
      }
      // Check if the member is trying to unrestrict themselves
      if (memberId === restrictedUserId) {
        throw new BDERROR("Member cannot unrestrict oneself", 400);
      }
      // Check if the restricted user is not already restricted
      if (!member.restrictedUsers.includes(restrictedUserId)) {
        throw new BDERROR("This user is not restricted", 400);
      }
      // Remove the restricted user from the member's restricted users list
      member.restrictedUsers = member.restrictedUsers.filter(
        (id) => id.toString() !== restrictedUserId
      );
      // Save the updated member to the database
      await member.save();
      // Send a success response
      return sendSuccessResponse(
        res,
        {
          message: "You have successfully unrestricted this user",
          memberData: sanitizeMemberData(member),
        },
        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  static async getRestrictedList(req, res) {
    const { memberId } = req.params;

    try {
      // Find the member
      const member = await Member.findById(memberId);
      // Check if the member exists
      if (!member) {
        throw new BDERROR("The member does not exist", 404);
      }
      // Send a success response
      return sendSuccessResponse(
        res,
        {
          restrictedUsers: member.restrictedUsers,
        },
        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  // Get followers list
  static async getFollowersList(req, res) {
    const { memberId } = req.params;

    try {
      // Find the member
      const member = await Member.findById(memberId);
      // Check if the member exists
      if (!member) {
        throw new BDERROR("The member does not exist", 404);
      }
      // Send a success response
      return sendSuccessResponse(
        res,
        {
          followers: member.connections.followers,
        },
        200
      );
    } catch (error) {
      // Handle any errors that occur during the process
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  // admin only delete member
  static async adminDeleteMember(req, res, next) {
    try {
      const { memberId } = req.params;

      // Find the member to delete
      const member = await Member.findById(memberId);

      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      // Delete the member post
      await Post.deleteMany({ member: memberId });
      // delete comments on the post
      await Post.deleteMany({ "comments.member": memberId });
      // delete the Post replies
      await Post.deleteMany({ "comments.replies.member": memberId });
      // Pull the Post likes
      await Post.updateMany({}, { $pull: { likes: memberId } });
      // Pull the Post comments likes
      await Post.updateMany({}, { $pull: { "comments.likes": memberId } });
      // delte Comments of member
      await Comment.deleteMany({ member: memberId });
      // delete story of member
      await Story.deleteMany({ member: memberId });
      // update post comment relies
      await Post.updateMany(
        {},
        { $pull: { "comments.replies": { member: memberId } } }
      );
      // update the member following
      await Member.updateMany(
        {},
        { $pull: { "connections.following": memberId } }
      );
      // update the member followers
      await Member.updateMany(
        {},
        { $pull: { "connections.followers": memberId } }
      );
      // update the member restricted
      await Member.updateMany({}, { $pull: { restrictedUsers: memberId } });
      // Comment replies
      await Comment.updateMany({}, { $pull: { "replies.member": memberId } });
      // delete comment replies likes
      await Comment.updateMany({}, { $pull: { "replies.likes": memberId } });
      // find and handle replies in comments
      const comments = await Comment.find({ "replies.member": memberId });
      comments.forEach(async (comment) => {
        const replies = await Comment.find({
          "replies.member": memberId,
          "replies._id": comment._id,
        });
        replies.forEach(async (reply) => {
          await Comment.updateOne(
            { _id: comment._id },
            { $pull: { replies: { _id: reply._id } } }
          );
        });
      });
      // delete the member
      promise.all([
        Member.deleteOne({ _id: memberId }),
        Comment.deleteMany({ member: memberId }),
      ]);
      await Member.deleteOne({ _id: memberId });

      return sendSuccessResponse(
        res,
        { message: "Member deleted successfully" },
        200
      );
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  // search member
  static async searchMember(req, res) {
    try {
      const { handle } = req.params;

      // Validate input: Ensure the handle parameter is provided
      if (!handle || handle.trim() === "") {
        throw new BDERROR("Please provide a valid handle", 400);
      }

      // Perform database query with regex for case-insensitive matching at the beginning of handle and fullName
      const members = await Member.find({
        $or: [
          { handle: { $regex: new RegExp(`^${handle}`, "i") } }, // Match handles starting with input
          { fullName: { $regex: new RegExp(`^${handle}`, "i") } }, // Match full names starting with input
        ],
      });

      // Check if any members were found
      if (members.length === 0) {
        throw new BDERROR("No members found", 404);
      }

      const sanitizedMembers = members.map(sanitizeMemberData);
      sendSuccessResponse(res, sanitizedMembers, 200);
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  // update profile picture
  static async createAvatarController(req, res) {
    const file = req.file;
    const memberId = req.params.memberId;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }

      if (!file) {
        throw new BDERROR("Please upload an image", 400);
      }
      const fileUrl = createFileUrl(file.filename);
      member.avatar = fileUrl;
      await member.save();

      const sanitizedMember = sanitizeMemberData(member);

      sendSuccessResponse(
        res,
        { message: "Profile picture updated", member: sanitizedMember },
        200
      );
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
  // update cover Image
  static async createCoverImageController(req, res) {
    const file = req.file;
    const memberId = req.params.memberId;
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member not found", 404);
      }
      if (!file) {
        throw new BDERROR("Please upload an image", 400);
      }
      const fileUrl = createFileUrl(file.filename);
      member.coverImage = fileUrl;
      await member.save();
      const sanitizedMember = sanitizeMemberData(member);
      sendSuccessResponse(
        res,
        { message: "Cover image updated", member: sanitizedMember },
        200
      );
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }
}
module.exports = MemberController;
