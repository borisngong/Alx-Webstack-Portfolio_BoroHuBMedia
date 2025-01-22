const jwt = require("jsonwebtoken");

/**
 * Responsible for generating an access token for a member
 * @function generateAccessToken
 * @param {Object} member - The member object containing `_id` and `handle`
 * @returns {string} - A signed JWT access token containing the member's ID and handle
 */
const generateAccessToken = (member) => {
  return jwt.sign(
    { id: member._id, handle: member.handle },
    process.env.SKEY_JWT,
    { expiresIn: process.env.EXP_JWT }
  );
};

/**
 * Responsible for generating a refresh token for a member
 * @function generateRefreshToken
 * @param {Object} member - The member object containing `_id`
 * @returns {string} - A signed JWT refresh token containing the member's ID
 */
const generateRefreshToken = (member) => {
  return jwt.sign({ id: member._id }, process.env.SKEY_JWT_REFRESH, {
    expiresIn: process.env.EXP_JWT_REFRESH,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
