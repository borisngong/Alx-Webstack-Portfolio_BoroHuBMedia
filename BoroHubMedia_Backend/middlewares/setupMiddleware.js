const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

/**
 * Sets up middleware for an Express application
 * @function setupMiddleware
 * @param {Object} app - The Express application instance
 * @returns {void}
 */
const setupMiddleware = (app) => {
  // Enable CORS
  app.use(cors());

  // Enable logging using Morgan in development mode
  app.use(morgan(":method :url :status :response-time ms"));

  // Enable JSON parsing for request bodies
  app.use(express.json());

  // Parse cookies from request headers
  app.use(cookieParser());

  // Enable security headers using Helmet
  app.use(helmet());
};

module.exports = setupMiddleware;
