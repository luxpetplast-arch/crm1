import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const checks = await prisma.qualityCheck.findMany({
      include: {
        product: true,
      },
      orderBy: { checkDate: 'desc' },
      take: 100,
    });
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quality checks' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const check = await prisma.qualityCheck.create({
      data: {
        ...req.body,
        checkedBy: req.user!.id,
      },
      include: { product: true },
    });
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quality check' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [total, passed, failed] = await Promise.all([
      prisma.qualityCheck.count(),
      prisma.qualityCheck.count({ where: { status: 'PASSED' } }),
      prisma.qualityCheck.count({ where: { status: 'FAILED' } }),
    ]);

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    res.json({
      total,
      passed,
      failed,
      passRate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quality stats' });
  }
});

export default router;