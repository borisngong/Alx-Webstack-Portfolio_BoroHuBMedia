/**
 * Responsible for sending success responses to the client with the data and status code
 * @param {*} res  - The response object
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
 * @param {*} res  - The response object
 * @param {*} error - The error object
 * @param {*} statusCode - The status code to send
 */
const sendErrorResponse = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: error.stack || error,
  });
};

module.exports = { sendSuccessResponse, sendErrorResponse };
