const jwt = require('jsonwebtoken');

function verifyToken(token, secret) {
  return jwt.verify(token, secret || process.env.JWT_SECRET);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'AUTH_FAILED', message: 'No token provided' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'AUTH_FAILED';
    res.status(401).json({ code, message: err.message });
  }
}

function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('AUTH_FAILED'));
  try {
    socket.user = verifyToken(token);
    next();
  } catch {
    next(new Error('AUTH_FAILED'));
  }
}

module.exports = { verifyToken, requireAuth, socketAuth };
