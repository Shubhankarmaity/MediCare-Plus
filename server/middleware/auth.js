const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Reads JWT from HTTP-Only cookie first, then falls back to Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const auth = (req, res, next) => {
    try {
        let token = null;

        // 1. Prefer HTTP-Only cookie (more secure)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // 2. Fall back to Authorization Header: "Bearer <token>"
        if (!token && req.header('Authorization')) {
            const authHeader = req.header('Authorization');
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        // JWT_SECRET is guaranteed to be set — startup crashes if missing
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }
        logger.error(`Auth middleware error: ${err.message}`);
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

module.exports = auth;