const jwt = require("jsonwebtoken");

const generateAccessToken = (member) => {
  return jwt.sign(
    { id: member._id, handle: member.handle },
    process.env.SKEY_JWT,
    { expiresIn: process.env.EXP_JWT }
  );
};

const generateRefreshToken = (member) => {
  return jwt.sign({ id: member._id }, process.env.REFRESH_JWT, {
    expiresIn: process.env.EXP_JWT,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
