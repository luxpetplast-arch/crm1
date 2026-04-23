import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/demand/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.saleItem.findMany({
      where: {
        productId,
        sale: { createdAt: { gte: thirtyDaysAgo } },
      },
      include: { sale: true },
    });

    const totalSold = sales.reduce((sum, item) => sum + item.quantity, 0);
    const avgDailyDemand = totalSold / 30;
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const daysUntilStockout = product.currentStock > 0 ? Math.floor(product.currentStock / avgDailyDemand) : 0;
    const monthlyForecast = Math.ceil(avgDailyDemand * 30);
    const recommendedProduction = Math.max(monthlyForecast - product.currentStock, 0);

    res.json({
      productId,
      productName: product.name,
      currentStock: product.currentStock,
      avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
      daysUntilStockout,
      monthlyForecast,
      recommendedProduction,
      velocity: totalSold > 0 ? 'fast' : 'slow',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Main forecast endpoint (for test compatibility)
router.get('/', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 🔧 N+1 FIX: Bitta query bilan barcha ma'lumotlarni olish
    const [products, salesByProduct] = await Promise.all([
      prisma.product.findMany(),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: { createdAt: { gte: thirtyDaysAgo } },
        },
        _sum: { quantity: true },
      }),
    ]);

    // Sales map yaratish (tez lookup uchun)
    const salesMap = new Map(salesByProduct.map(s => [s.productId, s._sum.quantity || 0]));

    const forecasts = products.map((product) => {
      const totalSold = salesMap.get(product.id) || 0;
      const avgDailyDemand = totalSold / 30;
      const daysUntilStockout = avgDailyDemand > 0 && product.currentStock > 0 
        ? Math.floor(product.currentStock / avgDailyDemand) 
        : 0;

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
        daysUntilStockout,
        monthlyForecast: Math.ceil(avgDailyDemand * 30),
        status: product.currentStock === 0 ? 'critical' : daysUntilStockout < 7 ? 'urgent' : 'ok',
      };
    });

    res.json(forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout));
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 🔧 N+1 FIX: Bitta query bilan barcha ma'lumotlarni olish
    const [products, salesByProduct] = await Promise.all([
      prisma.product.findMany(),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: { createdAt: { gte: thirtyDaysAgo } },
        },
        _sum: { quantity: true },
      }),
    ]);

    // Sales map yaratish
    const salesMap = new Map(salesByProduct.map(s => [s.productId, s._sum.quantity || 0]));

    const forecasts = products.map((product) => {
      const totalSold = salesMap.get(product.id) || 0;
      const avgDailyDemand = totalSold / 30;
      const daysUntilStockout = avgDailyDemand > 0 && product.currentStock > 0 
        ? Math.floor(product.currentStock / avgDailyDemand) 
        : 0;

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
        daysUntilStockout,
        velocity: totalSold > product.optimalStock ? 'fast' : totalSold > 0 ? 'medium' : 'slow',
        status: product.currentStock === 0 ? 'critical' : daysUntilStockout < 7 ? 'urgent' : 'ok',
      };
    });

    res.json(forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overview' });
  }
});

export default router;
