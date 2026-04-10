const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header: "Bearer <token>"
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied: No token provided" });
    
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ message: "Access Denied: Invalid token format" });

    // Get JWT secret from environment, warn if not set in production
    const jwtSecret = process.env.JWT_SECRET || "supersecretkey123";
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
      console.error('⚠️  SECURITY WARNING: JWT_SECRET is not set in production!');
    }
    
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified; // Attach user info to request
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid or malformed token" });
  }
};

module.exports = auth;