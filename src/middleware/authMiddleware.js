// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization; // "Bearer token"

    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = parts[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // payload: { username, role, iat, exp }
        if (payload.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.user = payload; // сохраняем пользователя в запрос
        next();
    } catch (err) {
        console.error('JWT verify error:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
