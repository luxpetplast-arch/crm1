import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { queues } from '../queues/config';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: string; latency: number };
    redis: { status: string; latency: number };
    queues: Record<string, { status: string; waiting: number; failed: number }>;
    memory: { status: string; used: number; total: number; percentage: number };
    disk?: { status: string; free: number; total: number; percentage: number };
  };
}

router.get('/', async (req, res) => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown', latency: 0 },
    redis: { status: 'unknown', latency: 0 },
    queues: {},
    memory: { status: 'unknown', used: 0, total: 0, percentage: 0 },
  };

  let overallStatus: HealthStatus['status'] = 'healthy';

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database.status = 'error';
    overallStatus = 'unhealthy';
  }

  // Redis check
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'ok',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis.status = 'error';
    overallStatus = 'degraded';
  }

  // Queue checks
  for (const [name, queue] of Object.entries(queues)) {
    try {
      const [waiting, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getFailedCount(),
      ]);
      
      checks.queues[name] = {
        status: failed > 100 ? 'warning' : 'ok',
        waiting,
        failed,
      };
      
      if (failed > 1000) overallStatus = 'degraded';
    } catch (error) {
      checks.queues[name] = {
        status: 'error',
        waiting: -1,
        failed: -1,
      };
    }
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memTotal = require('os').totalmem();
  checks.memory = {
    status: (memUsage.heapUsed / memTotal) > 0.9 ? 'warning' : 'ok',
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memTotal) * 100),
  };

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.json({ alive: true, uptime: process.uptime() });
});

// Security check endpoint
router.get('/security', (req, res) => {
  const securityInfo = {
    timestamp: new Date().toISOString(),
    headers: {
      'x-frame-options': res.get('X-Frame-Options') || 'not-set',
      'x-content-type-options': res.get('X-Content-Type-Options') || 'not-set',
      'x-xss-protection': res.get('X-XSS-Protection') || 'not-set',
      'strict-transport-security': res.get('Strict-Transport-Security') || 'not-set',
      'content-security-policy': res.get('Content-Security-Policy') ? 'set' : 'not-set',
    },
    environment: process.env.NODE_ENV || 'development',
    jwt_secret_set: !!process.env.JWT_SECRET,
    cors_origin: process.env.CORS_ORIGIN || 'default',
    rate_limiting: 'enabled',
    helmet: 'enabled'
  };
  
  res.json(securityInfo);
});

// Performance metrics
router.get('/metrics', async (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = {
    timestamp: new Date().toISOString(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000) + ' ms',
      system: Math.round(cpuUsage.system / 1000) + ' ms',
    },
    uptime: {
      seconds: Math.round(process.uptime()),
      formatted: formatUptime(process.uptime())
    },
    pid: process.pid,
    version: process.version,
    platform: process.platform
  };
  
  res.json(metrics);
});

// Helper function
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export default router;
