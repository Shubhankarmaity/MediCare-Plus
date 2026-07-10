/**
 * requireRole(...roles)
 * Middleware factory that checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER the `auth` middleware.
 *
 * Usage:
 *   router.post('/admin-only', auth, requireRole('admin', 'super-admin'), handler);
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access Denied. Not authenticated.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access Denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
            });
        }
        next();
    };
};

module.exports = { requireRole };
