/**
 * responsible for sensoring member data by removing sensitive information
 * @function sanitizeMemberData
 * @param {Object} member - The member object containing sensitive and non-sensitive data
 * @returns {Object} - A sanitized member object without sensitive information
 */
function sanitizeMemberData(member) {
  const { hashedPassword, ...sanitizedData } = member.toObject();
  return sanitizedData;
}

module.exports = { sanitizeMemberData };
