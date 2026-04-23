import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF Token store (production'da Redis ishlatish kerak)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// CSRF Token yaratish
export const generateCsrfToken = (sessionId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 soat
  csrfTokens.set(sessionId, { token, expires });
  return token;
};

// CSRF Token tekshirish middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // GET, HEAD, OPTIONS so'rovlarini o'tkazib yuborish
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // API endpointlarini tekshirish (header orqali)
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.headers['x-session-id'] || req.ip;

  if (!csrfToken || !sessionId) {
    return res.status(403).json({
      error: 'CSRF token yo\'q',
      message: 'Xavfsizlik tokeni kiritilishi shart'
    });
  }

  const stored = csrfTokens.get(sessionId as string);
  
  if (!stored || stored.token !== csrfToken || stored.expires < Date.now()) {
    return res.status(403).json({
      error: 'CSRF token noto\'g\'ri yoki muddati tugagan',
      message: 'Yangi token oling'
    });
  }

  next();
};

// Eski tokenlarni tozalash (har soatda)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 60 * 60 * 1000);

// XSS Protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Response headerlarni qo'shish
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // HTML tags ni olib tashlash
      return obj
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};

// Request logging with security info
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      // Security headers check
      securityHeaders: {
        'x-frame-options': res.get('X-Frame-Options') ? '✅' : '❌',
        'x-content-type-options': res.get('X-Content-Type-Options') ? '✅' : '❌',
        'x-xss-protection': res.get('X-XSS-Protection') ? '✅' : '❌',
      }
    };
    
    // Suspicious activity detection
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('⚠️ Suspicious activity detected:', logData);
    }
    
    // Slow request detection
    if (duration > 5000) {
      console.warn('🐌 Slow request:', logData);
    }
  });
  
  next();
};
