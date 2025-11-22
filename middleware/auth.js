import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {
        // Extract token from "Bearer <token>" format
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authorization header provided"
            });
        }

        // Check if it starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format. Use: Bearer <token>"
            });
        }

        // Extract the actual token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user info to request for use in controllers
        req.user = decoded;

        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // Generic error
        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

export default auth;