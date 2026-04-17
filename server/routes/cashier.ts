import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

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

// Cashier sales endpoint - handles sales created from cashier interface
router.post('/sales', authorize('CASHIER'), async (req: AuthRequest, res) => {
  try {
    console.log('📥 Cashier POST /sales - Data:', { 
      userId: req.user?.id, 
      bodySize: JSON.stringify(req.body).length 
    });

    // Import and use SalesService directly
    const { salesService } = await import('../services/SalesService');
    
    // Prepare user info for SalesService
    const userInfo = {
      id: req.user!.id,
      name: (req.user as any)?.name || req.user?.email || 'Cashier',
      email: req.user?.email || ''
    };

    // Create sale using SalesService
    const saleInput = {
      ...req.body,
      userId: req.user!.id,
      userName: userInfo.name
    };
    
    const result = await salesService.createSale(saleInput);
    
    console.log('✅ Cashier sale created successfully');
    res.json(result);
    
  } catch (error: any) {
    console.error('❌ Cashier sales error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Cashier sales creation failed', 
      details: error.message 
    });
  }
});

export default router;
