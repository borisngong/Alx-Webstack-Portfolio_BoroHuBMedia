const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

/**
 * Sets up middleware for an Express application
 * @function setupMiddleware
 * @param {Object} app - The Express application instance
 * @returns {void}
 */
const setupMiddleware = (app) => {
  // Enable logging using Morgan in development mode
  app.use(morgan('dev'));

  // Enable JSON parsing for request bodies
  app.use(express.json());

  // Parse cookies from request headers
  app.use(cookieParser());

  // Serve static files from the media/images directory
  app.use(
    '/media/images',
    express.static(path.join(__dirname, 'media/images')),
  );
};

module.exports = setupMiddleware;
