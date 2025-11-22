// Request logging middleware

const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    const requestInfo = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
    };

    // Log on response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';

        const logMessage = {
            ...requestInfo,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            level: logLevel
        };

        // In production, you could send this to a logging service (e.g., Winston, Logtail)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${logLevel}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
        } else {
            // In production, log as JSON for log aggregation services
            console.log(JSON.stringify(logMessage));
        }
    });

    next();
};

export default requestLogger;
