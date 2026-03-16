import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            purchaseOrders: true,
            rawMaterials: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

router.post('/', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({
      data: req.body,
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.put('/:id', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

export default router;