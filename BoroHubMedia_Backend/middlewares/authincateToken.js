const jwt = require("jsonwebtoken");
const { BDERROR } = require("../middlewares/handleErrors");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new BDERROR("Access denied. No token provided.", 401));
  }

  jwt.verify(token, process.env.SKEY_JWT, (err, user) => {
    if (err) {
      return next(new BDERROR("Invalid token.", 403));
    }

    req.user = user;
    next();
  });
};
