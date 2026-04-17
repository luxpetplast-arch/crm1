import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 soat

export interface IdempotencyRequest extends Request {
  idempotencyKey?: string;
}

export const idempotencyMiddleware = async (
  req: IdempotencyRequest,
  res: Response,
  next: NextFunction
) => {
  const key = req.headers['idempotency-key'] as string;
  
  if (!key) {
    return next();
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(key)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency key must be a valid UUID',
      },
    });
  }

  const cacheKey = `idempotency:${key}`;
  
  try {
    const existing = await redis.get(cacheKey);
    
    if (existing) {
      const cached = JSON.parse(existing);
      
      if (cached.status === 'processing') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'IDEMPOTENCY_IN_FLIGHT',
            message: 'Request with this key is still being processed',
            retryAfter: 5,
          },
        });
      }

      logger.info({ key }, 'Returning cached idempotency response');
      
      res.setHeader('Idempotency-Key', key);
      res.setHeader('Idempotency-Status', 'replayed');
      
      return res.status(cached.statusCode).json(cached.response);
    }

    await redis.setex(
      cacheKey,
      IDEMPOTENCY_TTL,
      JSON.stringify({ status: 'processing' })
    );

    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    let statusCode = 200;

    res.status = (code: number) => {
      statusCode = code;
      return originalStatus(code);
    };

    res.json = (body: any) => {
      if (statusCode >= 200 && statusCode < 300) {
        redis.setex(
          cacheKey,
          IDEMPOTENCY_TTL,
          JSON.stringify({
            status: 'completed',
            statusCode,
            response: body,
            completedAt: new Date().toISOString(),
          })
        ).catch(console.error);
      } else {
        redis.del(cacheKey).catch(console.error);
      }

      res.setHeader('Idempotency-Key', key);
      res.setHeader('Idempotency-Status', 'original');
      
      return originalJson(body);
    };

    req.idempotencyKey = key;
    next();
  } catch (error) {
    logger.error({ error, key }, 'Idempotency middleware error');
    next();
  }
};
