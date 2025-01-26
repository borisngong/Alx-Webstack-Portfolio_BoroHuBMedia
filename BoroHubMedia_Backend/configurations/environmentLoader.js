/**
 * responsible for loading environment variables from a .env file
 *
 * @returns {void}
 */
const dotenv = require("dotenv");

const setupEnvironment = () => {
  try {
    dotenv.config();
    console.log("Environment variables loaded");
  } catch (error) {
    console.error("Failed to load environment variables:", error);
    process.exit(1);
  }
};

module.exports = setupEnvironment;
