import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Development uchun random secret generatsiya qilish
  return 'dev-secret-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
})();

export interface AuthRequest extends Request {
  user?: { id: string; role: string; name?: string; email?: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  console.log('🔐 Auth check:', req.url);
  console.log('🔐 Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; name?: string; email?: string };
    console.log('✅ Token valid, user:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token invalid:', error instanceof Error ? error.message : 'Unknown');
    return res.status(401).json({ error: 'Invalid token', details: error instanceof Error ? error.message : 'Unknown' });
  }
};

// Alias for backward compatibility
export const authenticateToken = authenticate;

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.some(role => role.toUpperCase() === req.user?.role?.toUpperCase())) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles,
        yourRole: req.user?.role || 'unknown'
      });
    }
    next();
  };
};

// Restrict analytics access for cashiers
export const authorizeAnalytics = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role?.toLowerCase() === 'cashier') {
    return res.status(403).json({ error: 'Cashiers cannot access analytics' });
  }
  next();
};
