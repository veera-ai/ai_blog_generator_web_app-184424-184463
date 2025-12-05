'use strict';

const jwt = require('jsonwebtoken');

/**
 * Express middleware to verify JWT from Authorization: Bearer <token>.
 * Attaches req.user = { id } if valid.
 */
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
