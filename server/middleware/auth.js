const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header: "Bearer <token>"
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    const verified = jwt.verify(token, "supersecretkey123");
    req.user = verified; // Attach user info to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = auth;