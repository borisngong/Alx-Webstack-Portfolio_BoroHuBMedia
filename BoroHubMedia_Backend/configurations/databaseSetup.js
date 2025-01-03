const mongoose = require("mongoose");

const boroHubMediaAPIDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = boroHubMediaAPIDB;
