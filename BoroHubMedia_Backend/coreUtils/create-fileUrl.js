/**
 * Creates a file URL by combining the base URL from environment variables
 * @param {string} filename - The name of the file to create the URL for
 * @returns {string} The full file URL as a string
 */
const createFileUrl = (filename) => `${process.env.UPLOADS_BASE_URL}/media/images/${filename}`;

module.exports = { createFileUrl };
