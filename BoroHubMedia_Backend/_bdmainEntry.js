const dotenv = require("dotenv");

// Load environment variables if not in test environment
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const { setupServer, boroHubMediaAPIDB } = require("./serverCore");

const PORT = process.env.PORT || 3000;

// Function to start the server
const startServer = () => {
  // Connect to the database
  boroHubMediaAPIDB();

  // Start the server
  const appInstance = setupServer();

  appInstance.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return appInstance;
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = { startServer };
