import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { analyzeBusinessWithGemini } from '../utils/gemini';

const router = Router();

router.use(authenticate);

router.get('/analyze', async (req, res) => {
  try {
    console.log('🤖 Gemini Business AI tahlili boshlandi...');

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Ma'lumotlarni yig'ish
    const [sales, expenses, customers, products, debtors] = await Promise.all([
      prisma.sale.findMany({
        where: { createdAt: { gte: monthStart } },
        include: { items: { include: { product: true } } }
      }),
      prisma.expense.findMany({ where: { createdAt: { gte: monthStart } } }),
      prisma.customer.findMany({ include: { sales: true } }),
      prisma.product.findMany({ where: { active: true } }),
      prisma.customer.aggregate({ _sum: { debt: true } })
    ]);

    // 2. Metrikalarni hisoblash
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const productSales: any = {};
    sales.forEach(sale => {
      sale.items?.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product?.name || 'Unknown',
            revenue: 0,
            quantity: 0
          };
        }
        productSales[item.productId].revenue += item.subtotal;
        productSales[item.productId].quantity += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    const lowStockCount = products.filter(p => p.currentStock <= p.minStockLimit && p.currentStock > 0).length;
    const outOfStockCount = products.filter(p => p.currentStock === 0).length;

    const criticalIssues = [];
    if (outOfStockCount > 0) criticalIssues.push(`${outOfStockCount} ta mahsulot tugagan!`);
    if (debtors._sum.debt && debtors._sum.debt > 50000000) criticalIssues.push('Qarzlar miqdori juda yuqori!');
    if (netProfit < 0) criticalIssues.push('Ushbu oyda zarar ko\'rilmoqda!');

    // 3. Gemini tahlili
    const analysis = await analyzeBusinessWithGemini({
      totalRevenue,
      netProfit,
      totalExpenses,
      totalSales: sales.length,
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.sales.length > 0).length,
      totalDebt: debtors._sum.debt || 0,
      topProducts,
      lowStockCount,
      outOfStockCount,
      criticalIssues
    });

    res.json({ analysis });
  } catch (error: any) {
    console.error('Business AI Error:', error);
    res.status(500).json({ 
      error: 'Biznes tahlilida xatolik yuz berdi',
      message: error.message 
    });
  }
});

export default router;
