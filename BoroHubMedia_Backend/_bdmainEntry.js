const dotenv = require("dotenv");
const { setupServer, boroHubMediaAPIDB } = require("./serverCore");

// Load environment variables if not in test environment
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

// Function to start the server
const startServerInstance = () => {
  // Connect to the database
  boroHubMediaAPIDB();

  // Start the server
  const appInstance = setupServer();

  appInstance.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  });

  return appInstance;
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServerInstance();
}

module.exports = { startServerInstance };
