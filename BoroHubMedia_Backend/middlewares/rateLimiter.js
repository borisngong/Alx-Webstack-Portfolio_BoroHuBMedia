const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for login attempts to prevent brute force attacks
 */
const accessLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 5, // Only 5 login attempts per windowMs
  message: { message: "Too many login attempts, please try again later." },
});

// Rate limiter for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 1000 requests per windowMs
  message: { message: "Too many requests, please try again later." },
});

module.exports = { accessLimiter, apiLimiter };
