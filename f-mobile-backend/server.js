require('dotenv').config();

const express = require('express');
const mongoose = require('./config/database');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const Sale = require('./models/Sale');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourceSharing: true,
}));
app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and network IPs
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      }
      return pattern.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/cashiers', require('./routes/cashiers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/exchange-rate', require('./routes/exchangeRate'));
app.use('/api/income', require('./routes/income'));
app.use('/api/database', require('./routes/database'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/imei', require('./routes/imei'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/debug', require('./routes/debug'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: 'MongoDB'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Database: MongoDB`);
  
  // Schedule automatic cleanup of old sales (runs daily at 2:00 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
      
      console.log('[AUTO CLEANUP] Starting cleanup of sales older than:', twentyDaysAgo);
      
      const result = await Sale.deleteMany({
        createdAt: { $lt: twentyDaysAgo }
      });
      
      console.log(`[AUTO CLEANUP] ✓ Deleted ${result.deletedCount} old sales`);
    } catch (err) {
      console.error('[AUTO CLEANUP] ✗ Error:', err.message);
    }
  });
  
  console.log('✓ Automatic cleanup scheduled (daily at 2:00 AM)');
});
