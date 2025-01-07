const express = require('express');
const setupMiddleware = require('./middlewares/setupMiddleware');
const setupSwagger = require('./swagger/setupSwagger');
const setupPostman = require('./swagger/postmanSetup');
const memberRoute = require('./_bd_api/membersRoutes');
const authRoute = require('./_bd_api/authSessionRoutes');
const contentPostRoute = require('./_bd_api/contentPostRoutes');
const feedbackCommentRoute = require('./_bd_api/feedbackCommentRoutes');
const boroHubMediaAPIDB = require('./configurations/databaseSetup');
const { errorHandler } = require('./middlewares/handleErrors');
const setupEnvironment = require('./configurations/environmentLoader'); // Import environment loader

// Load environment variables
setupEnvironment();

// Middleware and routes setup function
const setupServer = () => {
  const app = express();

  // Middleware setup
  setupMiddleware(app);

  // Swagger setup
  setupSwagger(app);

  // Postman setup
  setupPostman(app);

  // Routes setup
  app.use('/api/auth', authRoute);
  app.use('/api/content', contentPostRoute);
  app.use('/api/member', memberRoute);
  app.use('/api/comment', feedbackCommentRoute);

  // Error handling middleware
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
    console.log(
      `Postman Docs available at http://localhost:${port}/postman-docs`,
    );
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
