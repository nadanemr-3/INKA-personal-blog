const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Read Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  // Expect format: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Access denied. Malformed token' });
  }

  const token = parts[1];

  try {
    // Verify token using the secret from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach authenticated user identity to the request
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access denied. Token expired' });
    }
    return res.status(401).json({ message: 'Access denied. Invalid token' });
  }
};

module.exports = authMiddleware;
