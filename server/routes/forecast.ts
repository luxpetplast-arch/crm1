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
    const products = await prisma.product.findMany();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const forecasts = await Promise.all(
      products.map(async (product) => {
        const sales = await prisma.saleItem.findMany({
          where: {
            productId: product.id,
            sale: { createdAt: { gte: thirtyDaysAgo } },
          },
        });

        const totalSold = sales.reduce((sum, item) => sum + item.quantity, 0);
        const avgDailyDemand = totalSold / 30;
        const daysUntilStockout = product.currentStock > 0 ? Math.floor(product.currentStock / avgDailyDemand) : 0;

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.currentStock,
          avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
          daysUntilStockout,
          monthlyForecast: Math.ceil(avgDailyDemand * 30),
          status: product.currentStock === 0 ? 'critical' : daysUntilStockout < 7 ? 'urgent' : 'ok',
        };
      })
    );

    res.json(forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout));
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const forecasts = await Promise.all(
      products.map(async (product) => {
        const sales = await prisma.saleItem.findMany({
          where: {
            productId: product.id,
            sale: { createdAt: { gte: thirtyDaysAgo } },
          },
        });

        const totalSold = sales.reduce((sum, item) => sum + item.quantity, 0);
        const avgDailyDemand = totalSold / 30;
        const daysUntilStockout = product.currentStock > 0 ? Math.floor(product.currentStock / avgDailyDemand) : 0;

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.currentStock,
          avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
          daysUntilStockout,
          velocity: totalSold > product.optimalStock ? 'fast' : totalSold > 0 ? 'medium' : 'slow',
          status: product.currentStock === 0 ? 'critical' : daysUntilStockout < 7 ? 'urgent' : 'ok',
        };
      })
    );

    res.json(forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overview' });
  }
});

export default router;
