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

class MemberAuthenticationController {
  /**
   *  Initializes a member account by creating a new member document in the database
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async initializeAccount(req, res, next) {
    try {
      const {
        plainPassword, emailAddress, handle, fullName, aboutMe, role,
      } = await initializeAccountSchema.validateAsync(req.body);

      const existingUser = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });

      if (existingUser) {
        throw new BDERROR('Email or handle is already taken', 400);
      }

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
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Accesses a member account by generating and sending access and refresh tokens
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async accessAccount(req, res, next) {
    try {
      const { emailAddress, handle, plainPassword } = req.body;
      if (!emailAddress && !handle) {
        throw new BDERROR('Email or handle is required to access account', 400);
      }

      const member = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });

      if (!member || !plainPassword) {
        throw new BDERROR('Input details incorrect', 401);
      }

      const isValidPassword = await bcrypt.compare(
        plainPassword,
        member.hashedPassword,
      );

      if (!isValidPassword) {
        throw new BDERROR('Input details incorrect', 401);
      }

      const accessToken = generateAccessToken(member);
      const refreshToken = generateRefreshToken(member);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 1 * 60 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccessResponse(
        res,
        {
          message: 'Member account accessed successfully!',
          member: sanitizeMemberData(member),
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
   *  Ends a member session by clearing the access and refresh tokens
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next - The next middleware function
   * @returns
   */
  static async endSession(req, res, next) {
    try {
      if (!req.cookies.accessToken) {
        throw new BDERROR('No session to end', 400);
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return sendSuccessResponse(
        res,
        { message: 'Member session ended successfully!' },
        203,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   *  Refreshes a member session by generating and sending a new access token
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async getMemberSession(req, res, next) {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new BDERROR('No session/token found, please log in', 404);
      }

      const data = jwt.verify(token, process.env.SKEY_JWT);
      const member = await Member.findById(data.id);
      if (!member) {
        throw new BDERROR('Member not found', 404);
      }

      return sendSuccessResponse(
        res,
        {
          message: 'Current member session retrieved successfully!',
          member: sanitizeMemberData(member),
        },
        200,
      );
    } catch (error) {
      return next
        ? next(error)
        : sendErrorResponse(
          res,
          new BDERROR('Invalid token, please log in', 401),
          401,
        );
    }
  }
}

module.exports = MemberAuthenticationController;
