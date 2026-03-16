import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/current-shift', async (req: AuthRequest, res) => {
  try {
    const shift = await prisma.cashierShift.findFirst({
      where: {
        userId: req.user!.id,
        status: 'OPEN',
      },
    });

    if (!shift) {
      return res.status(404).json({ error: 'No active shift' });
    }

    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current shift' });
  }
});

router.post('/open-shift', async (req: AuthRequest, res) => {
  try {
    const { openingBalance } = req.body;

    const existingShift = await prisma.cashierShift.findFirst({
      where: {
        userId: req.user!.id,
        status: 'OPEN',
      },
    });

    if (existingShift) {
      return res.status(400).json({ error: 'Shift already open' });
    }

    const shift = await prisma.cashierShift.create({
      data: {
        userId: req.user!.id,
        openingBalance,
      },
    });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to open shift' });
  }
});

router.post('/close-shift', async (req: AuthRequest, res) => {
  try {
    const { closingBalance } = req.body;

    const shift = await prisma.cashierShift.findFirst({
      where: {
        userId: req.user!.id,
        status: 'OPEN',
      },
    });

    if (!shift) {
      return res.status(404).json({ error: 'No active shift' });
    }

    const expectedBalance = shift.openingBalance + shift.cashSales;
    const difference = closingBalance - expectedBalance;

    const updatedShift = await prisma.cashierShift.update({
      where: { id: shift.id },
      data: {
        closingBalance,
        shortage: difference < 0 ? Math.abs(difference) : 0,
        overage: difference > 0 ? difference : 0,
        endTime: new Date(),
        status: 'CLOSED',
      },
    });

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to close shift' });
  }
});

router.get('/shifts', async (req: AuthRequest, res) => {
  try {
    const shifts = await prisma.cashierShift.findMany({
      where: { userId: req.user!.id },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

export default router;
