const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({ error: "Access Denied. No token provided" });
    };
    jwt.verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };