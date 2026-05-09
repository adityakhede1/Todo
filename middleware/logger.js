const jwt = require("jsonwebtoken");

function loggerMiddleware(req, res, next) {
    
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "You are not signed up"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_USER_PASSWORD);

        if (!decoded || !decoded.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        req.userId = decoded.id;

        next();

    } catch (err) {
        return res.status(403).json({
            message: "Authentication failed",
            error: err.message
        });
    }
}

module.exports = {
    loggerMiddleware
};