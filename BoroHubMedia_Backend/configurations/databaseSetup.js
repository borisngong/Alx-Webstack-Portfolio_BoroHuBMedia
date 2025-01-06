/**
 * Establishes a connection to the MongoDB database using Mongoose
 *
 * @returns {Promise<void>} A promise that resolves when the DB connection is established
 */
const mongoose = require('mongoose');

const boroHubMediaAPIDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = boroHubMediaAPIDB;
