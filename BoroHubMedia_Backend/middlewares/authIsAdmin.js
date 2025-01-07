const jwt = require('jsonwebtoken');
const Member = require('../coreModels/memberSchema');
const { sendErrorResponse } = require('../coreUtils/_bd_responseHandlers');

/**
 * Middleware to authenticate a user using a JWT token.
 * - Verifies the token from the request cookies.
 * - Attaches the authenticated member to the request object.
 * - Sends appropriate error responses if authentication fails.
 * @async
 * @function authenticateToken
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return sendErrorResponse(res, {
        message: 'Authentication token missing',
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.SKEY_JWT);
    const member = await Member.findById(decoded.id);

    if (!member) {
      return sendErrorResponse(res, {
        message: 'Member  cannot be found',
        statusCode: 404,
      });
    }

    req.member = member; // Attach the member to the request
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendErrorResponse(res, {
        message: "Invalid token make sure you're logged in",
        statusCode: 401,
      });
    }

    return sendErrorResponse(res, {
      message: 'Authentication failure',
      statusCode: 500,
    });
  }
};

/**
 * Middleware to verify if the authenticated user has admin privileges
 * - Checks if the member attached to the request has the 'admin' role
 * - Sends an error response if the user is not an admin
 * @function isAdmin
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const isAdmin = (req, res, next) => {
  if (!req.member || req.member.role !== 'admin') {
    return sendErrorResponse(res, {
      message: 'Admin privileges required. Only an admin can delete a member.',
      statusCode: 403,
    });
  }

  return next(); // Proceed if admin
};

module.exports = { authenticateToken, isAdmin };
