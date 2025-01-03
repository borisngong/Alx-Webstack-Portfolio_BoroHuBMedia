const express = require("express");
const sendSuccessResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

// Function to send error responses
const sendErrorResponse = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    error: error.stack || error,
  });
};

module.exports = { sendSuccessResponse, sendErrorResponse };
