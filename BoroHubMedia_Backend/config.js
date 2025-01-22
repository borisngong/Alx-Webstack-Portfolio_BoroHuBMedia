const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  mediaPath: process.env.MEDIA_PATH || path.join(__dirname, 'media/images'),
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DB_URI,
};
