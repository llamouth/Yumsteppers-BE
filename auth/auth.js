const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided" });
    }
    jwt.verify(token, secret, (err, user) => {
        if (err) {
            console.error("JWT Verification Failed:", err);
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
