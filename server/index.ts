import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import variantRoutes from './routes/variants';
import productVariantsRoutes from './routes/product-variants';
import rawMaterialRoutes from './routes/raw-materials';
import cardRoutes from './routes/cards';
import productTypeRoutes from './routes/product-types';
import productCategoriesRoutes from './routes/product-categories';
import supplierRoutes from './routes/suppliers';
import productionRoutes from './routes/production';
import qualityCheckRoutes from './routes/quality-checks';
import saleRoutes from './routes/sales';
import customerRoutes from './routes/customers';
import expenseRoutes from './routes/expenses';
import dashboardRoutes from './routes/dashboard';
import forecastRoutes from './routes/forecast';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import auditLogRoutes from './routes/audit-logs';
import cashierRoutes from './routes/cashier';
import taskRoutes from './routes/tasks';
import settingsRoutes from './routes/settings';
import notificationRoutes from './routes/notifications';
import backupRoutes from './routes/backup';
import analyticsRoutes from './routes/analytics';
import cashboxRoutes from './routes/cashbox';
import ordersRoutes from './routes/orders';
import inventoryAIRoutes from './routes/inventory-ai';
import megaAIRoutes from './routes/mega-ai';
import logisticsRoutes from './routes/logistics';
import superManagerRoutes from './routes/super-manager';
import cashboxAIRoutes from './routes/cashbox-ai';
import publicOrdersRoutes from './routes/public-orders';
import driversRoutes from './routes/drivers';
import customerChatRoutes from './routes/customer-chat';
import customerChatsRoutes from './routes/customer-chats';
import botApiRoutes from './routes/bot-api';
import statisticsRoutes from './routes/statistics';
import exportRoutes from './routes/export';
import printRoutes from './routes/print';
import bagLabelRoutes from './routes/bag-labels';
import businessAIRoutes from './routes/business-ai';
import budgetRoutes from './routes/budgets';
import loanRoutes from './routes/loans';
import { botManager } from './bot/bot-manager';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

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

// Bot API routes
app.use('/api/drivers', driversRoutes);
app.use('/api/bots', botApiRoutes);
app.use('/api/customer-chat', customerChatRoutes);
app.use('/api/customer-chats', customerChatsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/print', printRoutes);
app.use('/api/bag-labels', bagLabelRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/loans', loanRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
