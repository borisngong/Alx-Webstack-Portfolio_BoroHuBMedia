const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const memberRoute = require("./_bd_api/membersRoutes");
const authRoute = require("./_bd_api/authSessionRoutes");
const contentPostRoute = require("./_bd_api/contentPostRoutes");
const feedbackCommentRoute = require("./_bd_api/feedbackCommentRoutes");
const boroHubMediaAPIDB = require("./configurations/databaseSetup");
const { errorHandler } = require("./middlewares/handleErrors");
const resources = require("./middlewares/mediaUploads");

// Middleware and routes setup function
const setupServer = () => {
  const app = express();

  // Middleware setup
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    "/media/images",
    express.static(path.join(__dirname, "media/images"))
  );

  // Routes setup
  app.use("/api/auth", authRoute);
  app.use("/api/content", contentPostRoute);
  app.use("/api/member", memberRoute);
  app.use("/api/comment", feedbackCommentRoute);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};

// Start the server
const startServer = (port) => {
  const app = setupServer();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

module.exports = {
  setupServer,
  startServer,
  boroHubMediaAPIDB,
};
