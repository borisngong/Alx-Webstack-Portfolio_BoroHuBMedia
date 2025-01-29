const { BDERROR } = require('../middlewares/handleErrors');

/**
 * Responsible for sending success responses to the client with the data and status code
 * @param {*} res - The response object
 * @param {*} data - The data to send
 * @param {*} statusCode - The status code to send (default is 200)
 */
const sendSuccessResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Responsible for sending error responses to the client with the error message and status code
 * @param {Object} res - The response object
 * @param {Error} error - The error object
 * @param {number} [statusCode=400] - The status code to send
 */
const sendErrorResponse = (res, error, statusCode = 400) => {
  // Create a new BDERROR instance if necessary
  let errorResponse = error;

  if (!(errorResponse instanceof BDERROR)) {
    errorResponse = new BDERROR(
      error.message || 'Internal Server Error',
      statusCode,
    );
  }

  // Send the error response
  res.status(errorResponse.status || statusCode).json({
    success: false,
    message: errorResponse.message || 'Internal Server Error',
    status: errorResponse.status || statusCode,
    stack:
      process.env.NODE_ENV === 'development' ? errorResponse.stack : undefined, // Include stack trace in development only
  });
};

module.exports = { sendSuccessResponse, sendErrorResponse };
