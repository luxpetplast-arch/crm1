import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; name?: string; email?: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string; name?: string; email?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Alias for backward compatibility
export const authenticateToken = authenticate;

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.some(role => role.toUpperCase() === req.user?.role?.toUpperCase())) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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
