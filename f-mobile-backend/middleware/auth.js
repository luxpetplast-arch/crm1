const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token decoded successfully:', { username: decoded.username, role: decoded.role });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] Token verification error:', err.message);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  // First check if token exists
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('[AUTH] Token decoded:', { username: decoded.username, role: decoded.role });
    
    if (decoded.role !== 'admin') {
      console.log('[AUTH] Access denied - not admin:', { role: decoded.role });
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] Token verification error:', err.message);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = { auth, adminOnly };
