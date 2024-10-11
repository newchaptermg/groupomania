const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assuming the token contains userId
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
