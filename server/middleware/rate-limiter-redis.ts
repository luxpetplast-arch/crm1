import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 daqiqa
  maxRequests: 100,
  keyPrefix: 'ratelimit',
};

export const rateLimiter = (options: Partial<RateLimitOptions> = {}) => {
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${opts.keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.pexpire(key, opts.windowMs);
      }

      const ttl = await redis.pttl(key);

      res.setHeader('X-RateLimit-Limit', opts.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Date.now() + ttl);

      if (current > opts.maxRequests) {
        logger.warn({ ip, path: req.path }, 'Rate limit exceeded');
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Juda ko\'p so\'rovlar. Iltimos, keyinroq urinib ko\'ring.',
            retryAfter: Math.ceil(ttl / 1000),
          },
        });
      }

      next();
    } catch (error) {
      logger.error({ error }, 'Rate limiter Redis error');
      next();
    }
  };
};

export const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  keyPrefix: 'ratelimit:strict',
});

export const publicRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'ratelimit:public',
});
