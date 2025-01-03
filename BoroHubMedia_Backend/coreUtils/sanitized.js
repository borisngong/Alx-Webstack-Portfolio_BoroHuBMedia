const express = require("express");
//function to sanitize member data
function sanitizeMemberData(member) {
  const { hashedPassword, ...sanitizedData } = member.toObject();
  return sanitizedData;
}

// Export the helper function
module.exports = {
  sanitizeMemberData,
};
