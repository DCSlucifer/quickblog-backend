// Centralized error handling middleware

const errorHandler = (err, req, res, next) => {
    // Set default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(e => e.message);
        message = `Validation Error: ${errors.join(', ')}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `Duplicate value for field: ${field}`;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        // Only send stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
