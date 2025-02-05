const express = require('express');
const path = require('path');
const setupMiddleware = require('./middlewares/setupMiddleware');
const setupSwagger = require('./swagger/setupSwagger');
const memberRoute = require('./_bd_api/membersRoutes');
const authRoute = require('./_bd_api/authSessionRoutes');
const contentPostRoute = require('./_bd_api/contentPostRoutes');
const feedbackCommentRoute = require('./_bd_api/feedbackCommentRoutes');
const chatRoute = require('./_bd_api/chatRoutes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const boroHubMediaAPIDB = require('./configurations/databaseSetup');
const { errorHandler } = require('./middlewares/handleErrors');
const setupEnvironment = require('./configurations/environmentLoader');

// Load environment variables
setupEnvironment();

// Middleware and routes setup function
const setupServer = () => {
  const app = express();

  // Middleware setup
  setupMiddleware(app);

  // Swagger setup
  setupSwagger(app);

  app.use(
    '/media/images',
    express.static(path.join(__dirname, 'media/images')),
  );

  //

  // Rate limiter for general API endpoints setup to limit requests
  app.use('/api', apiLimiter);

  // Routes setup
  app.use('/api/auth', authRoute);
  app.use('/api/content', contentPostRoute);
  app.use('/api/member', memberRoute);
  app.use('/api/comment', feedbackCommentRoute);
  app.use('/api/chat', chatRoute);

  app.use(errorHandler);

  return app;
};

// Start the server
const startServer = async () => {
  const app = setupServer();
  const port = process.env.PORT || 3000;
  // Initialize database connection
  await boroHubMediaAPIDB();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
};

// Global error handling for unhandled rejections and exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = {
  setupServer,
  startServer,
  boroHubMediaAPIDB,
};
