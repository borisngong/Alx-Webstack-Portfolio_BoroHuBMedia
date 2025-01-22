const jwt = require('jsonwebtoken');
const Member = require('../coreModels/memberSchema');
const { sendErrorResponse } = require('../coreUtils/_bd_responseHandlers');

/**
 * Middleware to authenticate a user using a JWT token.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return sendErrorResponse(res, {
        message: 'Authentication token is missing. Please log in',
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.SKEY_JWT);

    const member = await Member.findById(decoded.id).select('role');

    if (!member) {
      return sendErrorResponse(res, {
        message: 'Member not found. Please verify and log in again.',
        statusCode: 404,
      });
    }

    req.member = member;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendErrorResponse(res, {
        message: 'Session expired. Please log in again to access the platform',
        statusCode: 401,
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return sendErrorResponse(res, {
        message: 'Invalid token. Please log in.',
        statusCode: 401,
      });
    }

    return sendErrorResponse(res, {
      message: 'Authentication failed due to an unexpected error.',
      statusCode: 500,
    });
  }
};

/**
 * Middleware to verify if the authenticated user has admin privileges.
 */
const isAdmin = (req, res, next) => {
  if (!req.member || !['admin'].includes(req.member.role)) {
    return sendErrorResponse(res, {
      message: 'Access denied. Admin privileges are required.',
      statusCode: 403,
    });
  }

  return next(); // Proceed if user is an admin
};

module.exports = { authenticateToken, isAdmin };
