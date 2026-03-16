import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/sales-summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      averageSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
      topProducts: await getTopProducts(where),
      salesByDay: await getSalesByDay(where),
    };

    res.json({ sales, summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        batches: { orderBy: { productionDate: 'desc' }, take: 5 },
        _count: { select: { saleItems: true } },
      },
    });

    const inventory = products.map((product) => ({
      ...product,
      totalValue: product.currentStock * product.pricePerBag,
      totalUnits: product.currentStock * product.unitsPerBag,
      status: getStockStatus(product),
    }));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

router.get('/customer-analysis', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: { include: { items: true } },
        payments: true,
      },
    });

    const analysis = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      category: customer.category,
      totalPurchases: customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalPayments: customer.payments.reduce((sum, payment) => sum + payment.amount, 0),
      debt: customer.debt,
      salesCount: customer.sales.length,
      lastPurchase: customer.lastPurchase,
      lastPayment: customer.lastPayment,
    }));

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate customer analysis' });
  }
});

router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [sales, expenses] = await Promise.all([
      prisma.sale.aggregate({ where, _sum: { totalAmount: true } }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);

    const revenue = sales._sum.totalAmount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const grossProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    res.json({
      revenue,
      expenses: totalExpenses,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate profit/loss report' });
  }
});

async function getTopProducts(where: any) {
  const items = await prisma.saleItem.findMany({
    where: { sale: where },
    include: { product: true },
  });

  const productMap = new Map();
  items.forEach((item) => {
    const existing = productMap.get(item.productId) || { quantity: 0, revenue: 0 };
    productMap.set(item.productId, {
      product: item.product,
      quantity: existing.quantity + item.quantity,
      revenue: existing.revenue + item.subtotal,
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

async function getSalesByDay(where: any) {
  const sales = await prisma.sale.findMany({ where });
  const dayMap = new Map();

  sales.forEach((sale) => {
    const day = sale.createdAt.toISOString().split('T')[0];
    const existing = dayMap.get(day) || { count: 0, total: 0 };
    dayMap.set(day, {
      date: day,
      count: existing.count + 1,
      total: existing.total + sale.totalAmount,
    });
  });

  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function getStockStatus(product: any) {
  if (product.currentStock === 0) return 'OUT_OF_STOCK';
  if (product.currentStock < product.minStockLimit) return 'CRITICAL';
  if (product.currentStock < product.optimalStock) return 'LOW';
  return 'GOOD';
}

// Sales report endpoint (for test compatibility)
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    res.json({
      sales,
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalQuantity,
        averageSale: sales.length > 0 ? totalRevenue / sales.length : 0,
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

export default router;
