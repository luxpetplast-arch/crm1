import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import inventoryOptimizer from '../ai/inventory-optimizer';

const router = Router();

/**
 * GET /api/inventory-ai/analyze/:productId
 * Bitta mahsulot uchun AI tahlil
 */
router.get('/analyze/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const analysis = await inventoryOptimizer.analyzeProductInventory(productId);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory-ai/analyze-all
 * Barcha mahsulotlar uchun AI tahlil
 */
router.get('/analyze-all', authenticateToken, async (req, res) => {
  try {
    const analyses = await inventoryOptimizer.analyzeAllProducts();
    res.json(analyses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory-ai/risks
 * Xavfli mahsulotlar ro'yxati
 */
router.get('/risks', authenticateToken, async (req, res) => {
  try {
    const risks = await inventoryOptimizer.findRiskyProducts();
    res.json(risks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory-ai/recommendations
 * Buyurtma tavsiyalari
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendations = await inventoryOptimizer.getOrderRecommendations();
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
