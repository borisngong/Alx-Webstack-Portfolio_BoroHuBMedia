const dotenv = require("dotenv");

const setupEnvironment = () => {
  dotenv.config();
  console.log("Environment variables loaded");
};

module.exports = setupEnvironment;
