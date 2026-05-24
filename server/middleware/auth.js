const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    let token = null;

    // 1. Read from HTTP-Only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fall back to Authorization Header: "Bearer <token>"
    if (!token && req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
    req.user = verified; // Attach user info to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = auth;