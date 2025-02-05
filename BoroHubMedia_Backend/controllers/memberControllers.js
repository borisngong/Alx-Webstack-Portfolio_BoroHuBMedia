const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateAccessToken } = require('../coreUtils/tokenUtils');
const Member = require('../coreModels/memberSchema');
const Content = require('../coreModels/contentPost');
const Comment = require('../coreModels/feedbackComment');
const { BDERROR } = require('../middlewares/handleErrors');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');
const { sanitizeMemberData } = require('../coreUtils/sanitized');
const { createFileUrl } = require('../coreUtils/create-fileUrl');

class MemberController {
  /**
   * refreshAccessToken - refreshing an access token using a refresh token
   * @param {Object} req - Represents the request object
   * @param {Object} res - Represents the response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async refreshAccessToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new BDERROR('No refresh token present in cookies', 401);
      }

      const data = await new Promise((resolve, reject) => {
        jwt.verify(
          refreshToken,
          process.env.SKEY_JWT_REFRESH,
          (err, decoded) => {
            if (err) {
              reject(new BDERROR('Invalid refresh token', 401));
            } else {
              resolve(decoded);
            }
          },
        );
      });

      const { id } = data;
      const member = await Member.findOne({ _id: id });

      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      const newAccessToken = generateAccessToken(member);
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 1 * 60 * 60 * 1000,
      });

      return sendSuccessResponse(
        res,
        { message: 'Access token refreshed successfully!' },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Retrieves a member by ID
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async getMember(req, res, next) {
    try {
      const { memberId } = req.params;

      if (!req.member) {
        throw new BDERROR('Authentication required', 401);
      }

      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      return sendSuccessResponse(res, member, 200);
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Updates a member's details.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async updateMember(req, res, next) {
    try {
      const { memberId } = req.params;
      const editData = req.body;

      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findByIdAndUpdate(memberId, editData, {
        new: true,
        runValidators: true,
      });
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      const memberData = sanitizeMemberData(member);
      return sendSuccessResponse(res, memberData, 200);
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for following a member
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async followMember(req, res, next) {
    const { memberId } = req.params;
    const followerId = req.member._id;

    try {
      if (!req.member) {
        throw new BDERROR('Authentication required', 401);
      }

      if (
        !mongoose.Types.ObjectId.isValid(memberId)
        || !mongoose.Types.ObjectId.isValid(followerId)
      ) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      const follower = await Member.findById(followerId);

      if (memberId === followerId.toString()) {
        throw new BDERROR('Member cannot follow oneself', 400);
      }
      if (!member) {
        throw new BDERROR(
          'The member you are trying to follow does not exist',
          404,
        );
      }
      if (!follower) {
        throw new BDERROR('The follower ID does not exist', 404);
      }

      if (member.connections.followers.includes(followerId)) {
        throw new BDERROR('You are already connected with this member', 400);
      }

      member.connections.followers.push(followerId);
      follower.connections.following.push(memberId);

      await member.save();
      await follower.save();

      return sendSuccessResponse(
        res,
        {
          message: 'You are now connected with this member',
          memberData: sanitizeMemberData(member),
        },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for unfollowing a member
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async unfollowMember(req, res, next) {
    const { memberId } = req.params;
    const followerId = req.member._id;

    try {
      if (!req.member) {
        throw new BDERROR('Authentication required', 401);
      }

      if (
        !mongoose.Types.ObjectId.isValid(memberId)
        || !mongoose.Types.ObjectId.isValid(followerId)
      ) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      const follower = await Member.findById(followerId);

      if (memberId === followerId.toString()) {
        throw new BDERROR('Member cannot unfollow oneself', 400);
      }
      if (!member) {
        throw new BDERROR(
          'The member you are trying to unfollow does not exist',
          404,
        );
      }
      if (!follower) {
        throw new BDERROR('The follower ID does not exist', 404);
      }

      if (!member.connections.followers.includes(followerId)) {
        throw new BDERROR('You are not connected with this member', 400);
      }

      member.connections.followers = member.connections.followers.filter(
        (id) => id.toString() !== followerId.toString(),
      );
      follower.connections.following = follower.connections.following.filter(
        (id) => id.toString() !== memberId.toString(),
      );

      await member.save();
      await follower.save();

      return sendSuccessResponse(
        res,
        {
          message: 'You have successfully unfollowed this member',
          memberData: sanitizeMemberData(member),
        },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for restricting a member from interacting with another member
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async restrictedMember(req, res, next) {
    const { restrictedUserId } = req.body;
    const memberId = req.member._id;

    try {
      if (!req.member) {
        throw new BDERROR('Authentication required', 401);
      }

      if (
        !mongoose.Types.ObjectId.isValid(memberId)
        || !mongoose.Types.ObjectId.isValid(restrictedUserId)
      ) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      const restrictedMember = await Member.findById(restrictedUserId);

      if (!restrictedMember) {
        throw new BDERROR('The restricted user ID does not exist', 404);
      }
      if (!member) {
        throw new BDERROR(
          'The member you are trying to restrict does not exist',
          404,
        );
      }
      if (memberId === restrictedUserId) {
        throw new BDERROR('Member cannot restrict oneself', 400);
      }
      if (member.restrictedUsers.includes(restrictedUserId)) {
        throw new BDERROR('This user is already restricted', 400);
      }

      member.restrictedUsers.push(restrictedUserId);
      member.connections.following = member.connections.following.filter(
        (id) => id.toString() !== restrictedUserId,
      );
      restrictedMember.connections.followers = restrictedMember.connections.followers.filter(
        (id) => id.toString() !== memberId,
      );

      await member.save();
      await restrictedMember.save();

      return sendSuccessResponse(
        res,
        {
          message: 'You have successfully restricted this user',
          memberData: sanitizeMemberData(member),
        },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for unblocking a member to interact with another member
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async unrestrictedMember(req, res, next) {
    const { restrictedUserId } = req.body;
    const memberId = req.member._id;

    try {
      if (!req.member) {
        throw new BDERROR('Authentication required', 401);
      }

      if (
        !mongoose.Types.ObjectId.isValid(memberId)
        || !mongoose.Types.ObjectId.isValid(restrictedUserId)
      ) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      const restrictedMember = await Member.findById(restrictedUserId);

      if (!restrictedMember) {
        throw new BDERROR('The restricted user ID does not exist', 404);
      }
      if (!member) {
        throw new BDERROR(
          'The member you are trying to unrestrict does not exist',
          404,
        );
      }
      if (memberId === restrictedUserId) {
        throw new BDERROR('Member cannot unrestrict oneself', 400);
      }
      if (!member.restrictedUsers.includes(restrictedUserId)) {
        throw new BDERROR('This user is not restricted', 400);
      }

      member.restrictedUsers = member.restrictedUsers.filter(
        (id) => id.toString() !== restrictedUserId,
      );
      await member.save();

      return sendSuccessResponse(
        res,
        {
          message: 'You have successfully unrestricted this user',
          memberData: sanitizeMemberData(member),
        },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for retrieving the list of restricted members
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async getRestrictedList(req, res, next) {
    const memberId = req.member._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('The member does not exist', 404);
      }

      return sendSuccessResponse(
        res,
        { restrictedUsers: member.restrictedUsers || [] },
        200,
      );
    } catch (error) {
      console.error('Error fetching restricted list:', error);
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for retrieving the list of followers for a member
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async getFollowersList(req, res, next) {
    const { memberId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('The member does not exist', 404);
      }

      return sendSuccessResponse(
        res,
        { followers: member.connections.followers },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for searching members by handle or full name
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async searchMember(req, res, next) {
    try {
      const { handle } = req.params;

      if (!handle || handle.trim() === '') {
        throw new BDERROR('Please provide a valid handle', 400);
      }

      const members = await Member.find({
        $or: [
          { handle: { $regex: new RegExp(`^${handle}`, 'i') } },
          { fullName: { $regex: new RegExp(`^${handle}`, 'i') } },
        ],
      });

      if (members.length === 0) {
        throw new BDERROR('No members found', 404);
      }

      const sanitizedMembers = members.map(sanitizeMemberData);
      return sendSuccessResponse(res, sanitizedMembers, 200);
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for updating a member's profile picture
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async createAvatarController(req, res, next) {
    const { file } = req;
    const memberId = req.member._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR("Member can't be found", 404);
      }

      if (!file) {
        throw new BDERROR('Please upload an image', 400);
      }

      const fileUrl = createFileUrl(file.filename);
      member.avatar = fileUrl;
      await member.save();

      const sanitizedMember = sanitizeMemberData(member);
      return sendSuccessResponse(
        res,
        { message: 'Profile picture updated', member: sanitizedMember },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Responsible for updating a member's cover image
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   * @returns {Promise<void>}
   */
  static async createCoverImageController(req, res, next) {
    const { file } = req;
    const memberId = req.member._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new BDERROR('Invalid member ID', 400);
      }

      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }
      if (!file) {
        throw new BDERROR('Please upload an image', 400);
      }

      const fileUrl = createFileUrl(file.filename);
      member.coverImage = fileUrl;
      await member.save();

      const sanitizedMember = sanitizeMemberData(member);
      return sendSuccessResponse(
        res,
        { message: 'Cover image updated', member: sanitizedMember },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Admin only deletes a member and their associated data.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>}
   */
  static async adminDeleteMember(req, res, next) {
    const { memberId } = req.params;

    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      await this.deleteAssociatedData(memberId);
      await member.deleteOne();

      return sendSuccessResponse(
        res,
        { message: 'Member and associated data deleted successfully.' },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * Deletes associated data for a member
   * @param {string} memberId - The member's ID
   */
  static async deleteAssociatedData(memberId) {
    const deleteOperations = [
      Content.deleteMany({ member: memberId }),
      Content.updateMany(
        { 'comments.member': memberId },
        { $pull: { 'comments.$[].likes': memberId } },
      ),
      Content.updateMany(
        { 'comments.replies.member': memberId },
        { $pull: { 'comments.$[].replies': { member: memberId } } },
      ),
      Content.updateMany({}, { $pull: { likes: memberId } }),
      Member.updateMany({}, { $pull: { 'connections.following': memberId } }),
      Member.updateMany({}, { $pull: { 'connections.followers': memberId } }),
      Member.updateMany({}, { $pull: { restrictedUsers: memberId } }),
      Comment.updateMany({}, { $pull: { replies: { member: memberId } } }),
    ];

    await Promise.all(deleteOperations);
    await this.removeMemberFromCommentReplies(memberId);
  }

  /**
   * Removes a member from the replies of comments
   * @param {string} memberId - The member's ID
   */
  static async removeMemberFromCommentReplies(memberId) {
    const commentsWithReplies = await Comment.find({
      replies: { $elemMatch: { member: memberId } },
    });

    const updatePromises = commentsWithReplies.map(async (comment) => {
      const updatedReplies = comment.replies.filter(
        (reply) => reply.member.toString() !== memberId,
      );
      return Comment.updateOne(
        { _id: comment._id },
        { replies: updatedReplies },
      );
    });

    await Promise.all(updatePromises);
  }
}

module.exports = MemberController;
