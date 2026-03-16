import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

router.post('/', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const material = await prisma.rawMaterial.create({
      data: req.body,
      include: { supplier: true },
    });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create raw material' });
  }
});

router.put('/:id', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const material = await prisma.rawMaterial.update({
      where: { id: req.params.id },
      data: req.body,
      include: { supplier: true },
    });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update raw material' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: {
        OR: [
          { currentStock: { lte: prisma.rawMaterial.fields.minStockLimit } },
          { currentStock: 0 },
        ],
      },
      include: { supplier: true },
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material alerts' });
  }
});

export default router;