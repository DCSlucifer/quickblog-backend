// Middleware to authorize user roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user?.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

export default authorizeRoles;
