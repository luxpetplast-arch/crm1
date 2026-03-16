import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  generateCashboxForecast, 
  performSecurityCheck, 
  getCashboxStatistics 
} from '../ai/cashbox-intelligence';

const router = Router();

router.use(authenticate);

// Kassa prognozi
router.get('/forecast', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    console.log(`🔮 Kassa prognozi (${days} kun)...`);
    const forecast = await generateCashboxForecast(days);
    res.json(forecast);
  } catch (error) {
    console.error('Cashbox forecast error:', error);
    res.status(500).json({ error: 'Prognozni yaratishda xatolik' });
  }
});

// Xavfsizlik tekshiruvi
router.post('/security-check', async (req, res) => {
  try {
    const userId = req.body.userId || (req as any).user.id;
    console.log('🔒 Xavfsizlik tekshiruvi...');
    const securityReport = await performSecurityCheck(userId);
    res.json(securityReport);
  } catch (error) {
    console.error('Security check error:', error);
    res.status(500).json({ error: 'Xavfsizlik tekshiruvida xatolik' });
  }
});

// Kassa statistikasi
router.get('/statistics', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    console.log(`📊 Kassa statistikasi (${days} kun)...`);
    const stats = await getCashboxStatistics(days);
    res.json(stats);
  } catch (error) {
    console.error('Cashbox statistics error:', error);
    res.status(500).json({ error: 'Statistikani olishda xatolik' });
  }
});

export default router;
