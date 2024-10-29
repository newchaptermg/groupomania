const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Authentication Middleware Invoked'); // Log statement

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No token provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Set the verified user on the request object
    console.log('Token Verified, req.user:', req.user); // Log the verified token details
    next(); 
  } catch (err) {
    console.error('Invalid Token:', err.message); // Log invalid token errors
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;
