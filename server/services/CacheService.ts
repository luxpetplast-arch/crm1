import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

export class CacheService {
  private static readonly DEFAULT_TTL = 300; // 5 daqiqa

  // Ma'lumotni cache'dan olish yoki funksiyani ishga tushirish
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = CacheService.DEFAULT_TTL
  ): Promise<T> {
    try {
      const cached = await redis.get(key);
      
      if (cached) {
        logger.debug({ key }, 'Cache hit');
        return JSON.parse(cached);
      }

      logger.debug({ key }, 'Cache miss');
      const result = await fn();
      
      // Faqat null/undefined emas natijalarni cache qilish
      if (result !== null && result !== undefined) {
        await redis.setex(key, ttl, JSON.stringify(result));
      }
      
      return result;
    } catch (error) {
      // Cache error bo'lsa, faqat funksiyani qaytarish
      logger.warn({ key, error }, 'Cache error, bypassing cache');
      return fn();
    }
  }

  // Cache'dan olish
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn({ key, error }, 'Cache get error');
      return null;
    }
  }

  // Cache'ga yozish
  async set(key: string, value: any, ttl: number = CacheService.DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.warn({ key, error }, 'Cache set error');
    }
  }

  // Cache'dan o'chirish
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.warn({ key, error }, 'Cache delete error');
    }
  }

  // Pattern bo'yicha o'chirish
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ pattern, count: keys.length }, 'Cache keys deleted');
      }
    } catch (error) {
      logger.warn({ pattern, error }, 'Cache pattern delete error');
    }
  }

  // Entity bo'yicha invalidate qilish
  async invalidateEntity(entity: string, id?: string): Promise<void> {
    if (id) {
      await this.deletePattern(`${entity}:${id}:*`);
    } else {
      await this.deletePattern(`${entity}:*`);
    }
    logger.debug({ entity, id }, 'Cache invalidated');
  }

  // Cache ma'lumotlarini olish
  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      const info = await redis.info('memory');
      const dbsize = await redis.dbsize();
      
      const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'unknown';
      
      return {
        keys: dbsize,
        memory: usedMemory,
      };
    } catch (error) {
      logger.warn({ error }, 'Cache stats error');
      return { keys: 0, memory: 'unknown' };
    }
  }

  // Barcha cache tozalash (ehtiyotkorlik bilan!)
  async flushAll(): Promise<void> {
    try {
      await redis.flushall();
      logger.warn('Cache flushed completely');
    } catch (error) {
      logger.error({ error }, 'Cache flush error');
    }
  }
}

export const cacheService = new CacheService();
