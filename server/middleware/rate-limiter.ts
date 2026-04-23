import rateLimit from 'express-rate-limit';

/**
 * Login endpoint uchun rate limiter
 * 15 daqiqada 5 ta urinish
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 5, // 5 ta urinish
  message: {
    error: 'Juda ko\'p urinish',
    message: '15 daqiqadan keyin qayta urinib ko\'ring',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP address olish
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Skip successful requests
  skipSuccessfulRequests: true
});

/**
 * Registration endpoint uchun rate limiter
 * 1 soatda 3 ta urinish
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 3,
  message: {
    error: 'Juda ko\'p ro\'yxatdan o\'tish urinishi',
    message: '1 soatdan keyin qayta urinib ko\'ring'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * API endpoint lar uchun umumiy rate limiter
 * 1 daqiqada 100 ta request
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 daqiqa
  max: 100,
  message: {
    error: 'Juda ko\'p so\'rov',
    message: 'Iltimos, biroz kuting'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Muhim operatsiyalar uchun (delete, update)
 * 5 daqiqada 20 ta request
 */
export const criticalOperationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 daqiqa
  max: 20,
  message: {
    error: 'Juda ko\'p o\'zgartirish',
    message: 'Iltimos, sekinroq ishlang'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload uchun
 * 10 daqiqada 10 ta file
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 daqiqa
  max: 10,
  message: {
    error: 'Juda ko\'p fayl yuklash',
    message: '10 daqiqadan keyin qayta urinib ko\'ring'
  },
  standardHeaders: true,
  legacyHeaders: false
});
