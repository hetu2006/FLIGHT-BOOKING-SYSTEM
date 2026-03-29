const jwt = require("jsonwebtoken");

const generateAccessToken = (userdata) => {
  return jwt.sign(userdata, process.env.TOKEN_SECRET);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader == null || authHeader == undefined) return res.sendStatus(403);

  const token_prefix = authHeader.split(" ")[0];
  const token = authHeader && authHeader.split(" ")[1];

  if (token_prefix !== process.env.TOKEN_PREFIX) return res.sendStatus(403);

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};

const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader == null || authHeader == undefined) {
    return res.status(401).json({
      success: false,
      message: "No authorization header provided"
    });
  }

  const token_prefix = authHeader.split(" ")[0];
  const token = authHeader && authHeader.split(" ")[1];

  if (token_prefix !== process.env.TOKEN_PREFIX) {
    return res.status(401).json({
      success: false,
      message: "Invalid token format"
    });
  }

  if (token == null) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Support both role styles used in this project ("admin" and env ADMIN UUID).
    const adminRoles = new Set(["admin", process.env.ADMIN].filter(Boolean));
    if (!user.role || !adminRoles.has(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient privileges. Admin access required.",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  generateAccessToken,
  authenticateToken,
  authenticateAdminToken,
};
