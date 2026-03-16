const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

// Simple test server
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test export products
app.get('/test-export/products', async (req, res) => {
  try {
    console.log('Testing product export...');
    
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { name: 'asc' }
    });

    const exportData = products.map(product => ({
      ID: product.id,
      Nomi: product.name,
      'Qop turi': product.bagType,
      'Qopdagi donalar soni': product.unitsPerBag,
      'Minimal zaxira': product.minStockLimit,
      'Optimal zaxira': product.optimalStock,
      'Maksimal sig\'im': product.maxCapacity,
      'Joriy zaxira (qop)': product.currentStock,
      'Joriy zaxira (dona)': product.currentUnits,
      'Narx qop uchun': product.pricePerBag,
      'Ishlab chiqarish narxi': product.productionCost,
      'Yaratilgan sana': new Date(product.createdAt).toLocaleDateString('uz-UZ'),
      'Yangilangan sana': new Date(product.updatedAt).toLocaleDateString('uz-UZ')
    }));

    res.json({
      success: true,
      total: products.length,
      data: exportData
    });

  } catch (error) {
    console.error('Export test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test export customers
app.get('/test-export/customers', async (req, res) => {
  try {
    console.log('Testing customer export...');
    
    const customers = await prisma.customer.findMany({
      take: 5,
      orderBy: { name: 'asc' }
    });

    const exportData = customers.map(customer => ({
      ID: customer.id,
      'Ismi': customer.name,
      'Email': customer.email || '',
      'Telefon': customer.phone,
      'Manzil': customer.address || '',
      'Balans': customer.balance,
      'Qarz': customer.debt,
      'Kredit limiti': customer.creditLimit,
      'Kategoriya': customer.category,
      'Yaratilgan sana': new Date(customer.createdAt).toLocaleDateString('uz-UZ'),
      'Yangilangan sana': new Date(customer.updatedAt).toLocaleDateString('uz-UZ')
    }));

    res.json({
      success: true,
      total: customers.length,
      data: exportData
    });

  } catch (error) {
    console.error('Export test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test statistics
app.get('/test-export/statistics', async (req, res) => {
  try {
    console.log('Testing export statistics...');
    
    const [
      totalProducts,
      totalCustomers,
      lowStockProducts,
      outOfStockProducts,
      customersWithDebt,
      activeCustomers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { currentStock: { lte: prisma.product.fields.minStockLimit } } }),
      prisma.product.count({ where: { currentStock: 0 } }),
      prisma.customer.count({ where: { debt: { gt: 0 } } }),
      prisma.customer.count({ 
        where: { 
          lastPurchase: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      })
    ]);

    const statistics = {
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        normal: totalProducts - lowStockProducts - outOfStockProducts
      },
      customers: {
        total: totalCustomers,
        withDebt: customersWithDebt,
        active: activeCustomers,
        inactive: totalCustomers - activeCustomers
      },
      exportDate: new Date().toISOString()
    };

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Statistics test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/test-export/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Export test server is running!'
  });
});

const PORT = 5002;

app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🧪 Export Test Server Running on port ${PORT}!      ║
║                                                       ║
║  📊 Test endpoints:                                   ║
║  • GET /test-export/health                            ║
║  • GET /test-export/products                          ║
║  • GET /test-export/customers                         ║
║  • GET /test-export/statistics                        ║
║                                                       ║
║  🌐 URL: http://localhost:${PORT}                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down test server...');
  await prisma.$disconnect();
  process.exit(0);
});
