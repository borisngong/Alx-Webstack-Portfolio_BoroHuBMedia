const express = require("express");

// Error class to handle specific errors with status codes
class BDERROR extends Error {
  /**
   * Creates an instance of BDERROR.
   * @param {string} message - The error message.
   * @param {number} [status=500] - The HTTP status code.
   */
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware to handle errors in the application.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof BDERROR) {
    return res.status(err.status).json({
      error: err.message,
      status: err.status,
    });
  }

  // Handle generic internal server errors
  return res.status(500).json({
    error: "Internal server error",
    status: 500,
  });
};

module.exports = { errorHandler, BDERROR };
