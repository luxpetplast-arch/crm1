import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category, currency } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }
    if (category) where.category = category;
    if (currency) where.currency = currency;

    const expenses = await prisma.expense.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/', authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res) => {
  try {
    const expense = await prisma.expense.create({
      data: { ...req.body, userId: req.user!.id },
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const expenses = await prisma.expense.groupBy({
      by: ['category', 'currency'],
      where,
      _sum: { amount: true },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
