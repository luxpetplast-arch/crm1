import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSwagger } from './swagger.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import variantRoutes from './routes/variants.js';
import productVariantsRoutes from './routes/product-variants.js';
import rawMaterialRoutes from './routes/raw-materials.js';
import cardRoutes from './routes/cards.js';
import productTypeRoutes from './routes/product-types.js';
import productCategoriesRoutes from './routes/product-categories.js';
import supplierRoutes from './routes/suppliers.js';
import productionRoutes from './routes/production.js';
import qualityCheckRoutes from './routes/quality-checks.js';
import saleRoutes from './routes/sales.js';
import customerRoutes from './routes/customers.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';
import forecastRoutes from './routes/forecast.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';
import auditLogRoutes from './routes/audit-logs.js';
import cashierRoutes from './routes/cashier.js';
import taskRoutes from './routes/tasks.js';
import settingsRoutes from './routes/settings.js';
import notificationRoutes from './routes/notifications.js';
import backupRoutes from './routes/backup.js';
import analyticsRoutes from './routes/analytics.js';
import cashboxRoutes from './routes/cashbox.js';
import ordersRoutes from './routes/orders.js';
import inventoryAIRoutes from './routes/inventory-ai.js';
import megaAIRoutes from './routes/mega-ai.js';
import logisticsRoutes from './routes/logistics.js';
import superManagerRoutes from './routes/super-manager.js';
import cashboxAIRoutes from './routes/cashbox-ai.js';
import publicOrdersRoutes from './routes/public-orders.js';
import driversRoutes from './routes/drivers.js';
import customerChatRoutes from './routes/customer-chat.js';
import customerChatsRoutes from './routes/customer-chats.js';
import botApiRoutes from './routes/bot-api.js';
import statisticsRoutes from './routes/statistics.js';
import exportRoutes from './routes/export.js';
import printRoutes from './routes/print.js';
import bagLabelRoutes from './routes/bag-labels.js';
import businessAIRoutes from './routes/business-ai.js';
import budgetRoutes from './routes/budgets.js';
// import loanRoutes from './routes/loans'; // Fayl yo'q
// import { botManager } from './bot/bot-manager'; // Vaqtinchalik o'chirildi

const app = express();
const PORT = process.env.PORT || 5003;

console.log('🚀 Server starting...');
console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);

// 🔒 HELMET - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false, // Development uchun
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 🔒 Rate Limiting - DDoS himoyasi
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 100, // Har IP uchun 100 ta so'rov
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10, // Faqat 10 ta login urinish
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:25852',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Development uchun barcha CORS sozlamalari
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: '*', // Barcha originlarga ruxsat
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'X-Request-ID', 'x-request-time', 'X-Request-Time', 'Origin', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
  }));
} else {
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'X-Request-ID', 'x-request-time', 'X-Request-Time'],
    credentials: true
  }));
}
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger API Documentation
setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/product-variants', productVariantsRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/product-categories', productCategoriesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality-checks', qualityCheckRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cashbox', cashboxRoutes);
app.use('/api/inventory-ai', inventoryAIRoutes);
app.use('/api/mega-ai', megaAIRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/super-manager', superManagerRoutes);
app.use('/api/cashbox-ai', cashboxAIRoutes);
app.use('/api/business-ai', businessAIRoutes);

// Public routes (autentifikatsiya kerak emas)
app.use('/api/public', publicOrdersRoutes);

// Bot API routes (vaqtinchalik o'chirildi)
// app.use('/api/drivers', driversRoutes);
// app.use('/api/bots', botApiRoutes);
// app.use('/api/customer-chat', customerChatRoutes);
// app.use('/api/customer-chats', customerChatsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/print', printRoutes);
app.use('/api/bag-labels', bagLabelRoutes);
app.use('/api/budgets', budgetRoutes);
// app.use('/api/loans', loanRoutes); // Fayl yo'q

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, '..', 'dist');
  
  console.log('📁 Serving static files from:', distPath);
  
  app.use(express.static(distPath));
  
  // SPA catch-all route - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// 🔒 Security middleware
import { securityLogger, sanitizeInput } from './middleware/security.js';
app.use(securityLogger);
app.use(sanitizeInput);

// Global error handler - yangilangan
import { errorHandler } from './middleware/error-handler.js';
app.use(errorHandler);

// Auth test endpoint
import jwt from 'jsonwebtoken';
app.get('/api/test-auth', (req, res) => {
  const auth = req.headers.authorization;
  console.log('🧪 Test auth - Header present:', !!auth);
  
  if (!auth) {
    return res.status(401).json({ error: 'No auth header' });
  }
  
  const token = auth.split(' ')[1];
  console.log('🧪 Test auth - Token:', token ? token.substring(0, 30) + '...' : 'missing');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('✅ Test auth - Valid, user:', (decoded as any).id);
    res.json({ valid: true, user: decoded });
  } catch (e) {
    console.log('❌ Test auth - Invalid:', e instanceof Error ? e.message : 'Unknown');
    res.status(401).json({ valid: false, error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🚀 AzizTrades ERP Server Running! 🚀          ║
║                                                       ║
║  📊 API:    http://localhost:${PORT}/api              ║
║  🔐 Health: http://localhost:${PORT}/api/health       ║
║  💻 Frontend: http://localhost:3000                   ║
║                                                       ║
║  📧 Login: admin@aziztrades.com                      ║
║  🔑 Password: admin123                               ║
║                                                       ║
║  🆕 NEW MODULES:                                     ║
║  🏭 Production Management                            ║
║  📦 Raw Materials & Suppliers                       ║
║  🛡️  Quality Control                                 ║
║  ✅ Task Management                                  ║
║  💰 Advanced Financial Control                      ║
║  🤖 Multi-Bot System (Disabled)                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  // Bot manager'ni ishga tushirish (vaqtinchalik o'chirildi)
  // console.log('🤖 Bot Manager ishga tushirilmoqda...');
  // await botManager.initAllBots();
});
