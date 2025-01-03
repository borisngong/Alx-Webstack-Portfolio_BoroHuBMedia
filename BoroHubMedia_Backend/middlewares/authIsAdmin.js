const jwt = require("jsonwebtoken");
const Member = require("../coreModels/memberSchema");
const { BDERROR } = require("./handleErrors");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next(new BDERROR("Authentication token missing", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.SKEY_JWT);
    console.log("Decoded ID:", decoded.id);

    const member = await Member.findById(decoded.id);
    console.log("Member found:", member);

    if (!member) {
      return next(new BDERROR("User not found", 404));
    }

    req.member = member;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    next(new BDERROR("Invalid or expired token", 401));
  }
};

const isAdmin = (req, res, next) => {
  if (!req.member || req.member.role !== "admin") {
    return next(new BDERROR("Admin privileges required", 403));
  }
  next();
};

module.exports = { authenticateToken, isAdmin };
