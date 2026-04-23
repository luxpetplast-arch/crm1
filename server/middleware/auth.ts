import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// FIXED: JWT secret har doim bir xil bo'lishi kerak
const JWT_SECRET = process.env.JWT_SECRET;

// JWT_SECRET tekshiruvi
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// Production da zaif secret tekshiruvi
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = ['secret', 'dev-secret', 'test', 'password', '123456'];
  if (weakSecrets.some(weak => JWT_SECRET.toLowerCase().includes(weak))) {
    throw new Error('JWT_SECRET is too weak for production');
  }
}

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
