import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailySales, monthlySales, totalDebt, expenses, topProducts, topCustomers, lowStock] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.customer.aggregate({
        _sum: { debt: true },
      }),
      prisma.expense.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 5,
      }),
      prisma.sale.groupBy({
        by: ['customerId'],
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { currentStock: { lte: prisma.product.fields.minStockLimit } },
            { currentStock: 0 },
          ],
        },
        take: 10,
      }),
    ]);

    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const customerIds = topCustomers.map(c => c.customerId);
    const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });

    const revenue = monthlySales._sum.totalAmount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netProfit = revenue - totalExpenses;

    res.json({
      dailyRevenue: dailySales._sum.totalAmount || 0,
      monthlyRevenue: revenue,
      netProfit,
      totalExpenses,
      totalDebt: totalDebt._sum.debt || 0,
      topProducts: topProducts.map(tp => ({
        ...products.find(p => p.id === tp.productId),
        totalSold: tp._sum.quantity,
        revenue: tp._sum.subtotal,
      })),
      topCustomers: topCustomers.map(tc => ({
        ...customers.find(c => c.id === tc.customerId),
        totalSpent: tc._sum.totalAmount,
      })),
      lowStock,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
