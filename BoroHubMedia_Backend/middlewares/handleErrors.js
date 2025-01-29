/**
 * Custom error class to handle api errors
 */
class BDERROR extends Error {
  /**
   * Creates an instance of BDERROR
   * @param {string} message - The error message
   * @param {number} [status=500] - The HTTP status code
   */
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware to handle errors in the application
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    status: statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  next();
};

module.exports = { errorHandler, BDERROR };
