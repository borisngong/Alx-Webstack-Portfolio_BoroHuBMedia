const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Member = require('../coreModels/memberSchema');
const { BDERROR } = require('../middlewares/handleErrors');
const {
  initializeAccountSchema,
} = require('../coreModels/schemas/initializeAccountSchema');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../coreUtils/tokenUtils');
const { sanitizeMemberData } = require('../coreUtils/sanitized');

/**
 * MemberAuthenticationController class to manage member-related operations
 */
class MemberAuthenticationController {
  /**
   * initializeAccount - Responsible for initializing a new member account
   * @param {Object} req - Represents request object
   * @param {Object} res - Represents the response object
   */
  static async initializeAccount(req, res) {
    try {
      // Validate input using Joi schema
      const {
        plainPassword, emailAddress, handle, fullName, aboutMe, role,
      } = await initializeAccountSchema.validateAsync(req.body);

      // Check for existing member with the same email or handle
      const existingUser = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });

      if (existingUser) {
        throw new BDERROR('Email or handle is already taken', 400);
      }

      // Hash the password and create a new member
      const bcryptHashedPassword = await bcrypt.hash(plainPassword, 10);
      const newUser = new Member({
        fullName,
        handle,
        emailAddress,
        hashedPassword: bcryptHashedPassword,
        aboutMe,
        role,
      });

      const savedUser = await newUser.save();

      return sendSuccessResponse(
        res,
        {
          message: 'Member account initialized successfully!',
          member: sanitizeMemberData(savedUser),
        },
        201,
      );
    } catch (error) {
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * accessAccount - Responsible for authenticating a member and returns access and refresh tokens
   * @param {Object} req - Represents the request object
   * @param {Object} res - Represents the response object
   */
  static async accessAccount(req, res) {
    const { emailAddress, handle, plainPassword } = req.body;

    try {
      if (!emailAddress && !handle) {
        throw new BDERROR('Email or handle is required to access account', 400);
      }

      // Ensure at least one of the email or handle is valid
      const member = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });

      if (!member) {
        return sendErrorResponse(
          res,
          new BDERROR('Input details incorrect', 401),
        );
      }

      if (!plainPassword) {
        throw new BDERROR('Password is required to access account', 400);
      }

      // Compare the hashed password with the provided password
      const isValidPassword = await bcrypt.compare(
        plainPassword,
        member.hashedPassword,
      );

      if (!isValidPassword) {
        return sendErrorResponse(
          res,
          new BDERROR('Input details incorrect', 401),
        );
      }

      const accessToken = generateAccessToken(member);
      const refreshToken = generateRefreshToken(member);

      if (
        req.cookies.accessToken
        && req.cookies.accessToken.expires < Date.now()
      ) {
        // Refresh the access token
        const newAccessToken = await this.refreshAccessToken(req, res);
        return sendSuccessResponse(
          res,
          {
            message: 'Access token refreshed successfully!',
            accessToken: newAccessToken,
          },
          200,
        );
      }

      // Set the access token in an HttpOnly cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 1 * 60 * 60 * 1000,
      });

      // Set refresh token in a cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Sanitize member data to return without the password
      const sanitizedMember = sanitizeMemberData(member);

      return sendSuccessResponse(
        res,
        {
          message: 'Member account accessed successfully!',
          member: sanitizedMember,
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * endSession - Responsible for ending the member session by clearing cookies
   * @param {Object} req - Represents request object
   * @param {Object} res - Represents response object
   */
  static async endSession(req, res) {
    try {
      if (!req.cookies.accessToken) {
        throw new BDERROR('No session to end', 400);
      }

      // Clear the access token and refresh token cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return sendSuccessResponse(
        res,
        {
          message: 'Member session ended successfully!',
        },
        200,
      );
    } catch (error) {
      return sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * getUser Session - Responsible for retrieving the current member's session information
   * @param {Object} req - Represents the request object
   * @param {Object} res - Represents the response object
   */
  static async getMemberSession(req, res) {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new BDERROR('No session/token found, please log in', 404);
    }

    try {
      // Verify the token
      const data = jwt.verify(token, process.env.SKEY_JWT);
      const { id } = data;
      const member = await Member.findOne({ _id: id });

      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      // Sanitize member data to return without the password
      const sanitizedMember = sanitizeMemberData(member);

      return sendSuccessResponse(
        res,
        {
          message: 'Current member session retrieved successfully!',
          member: sanitizedMember,
        },
        200,
      );
    } catch (error) {
      if (error instanceof BDERROR) {
        return sendErrorResponse(res, error, error.statusCode);
      }
      return sendErrorResponse(
        res,
        new BDERROR('Invalid token, please you must be logged in', 401),
        401,
      );
    }
  }
}

module.exports = MemberAuthenticationController;
