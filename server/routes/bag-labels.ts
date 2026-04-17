import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authenticateToken } from '../middleware/auth';

const router = Router();

// Barcha qop yorliqlarini olish
router.get('/', authenticate, async (req, res) => {
  try {
    const { productId, status, dateFrom, dateTo, workerId, limit = '100' } = req.query;
    
    const where: any = {};
    
    if (productId) {
      where.productId = String(productId);
    }
    
    if (status) {
      where.status = String(status);
    }
    
    if (workerId) {
      where.workerId = String(workerId);
    }
    
    if (dateFrom || dateTo) {
      where.productionDate = {};
      if (dateFrom) {
        where.productionDate.gte = new Date(String(dateFrom));
      }
      if (dateTo) {
        where.productionDate.lte = new Date(String(dateTo));
      }
    }
    
    const labels = await prisma.bagLabel.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            bagType: true
          }
        }
      },
      orderBy: {
        printedAt: 'desc'
      },
      take: parseInt(String(limit))
    });
    
    res.json(labels);
  } catch (error) {
    console.error('Error fetching bag labels:', error);
    res.status(500).json({ error: 'Failed to fetch bag labels' });
  }
});

// Bitta yorliqni olish (barkod bo'yicha)
router.get('/by-barcode/:barcode', authenticateToken, async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const label = await prisma.bagLabel.findUnique({
      where: { barcode },
      include: {
        product: {
          select: {
            name: true,
            bagType: true,
            currentStock: true
          }
        }
      }
    });
    
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }
    
    res.json(label);
  } catch (error) {
    console.error('Error fetching bag label:', error);
    res.status(500).json({ error: 'Failed to fetch bag label' });
  }
});

// Yangi yorliqlar yaratish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { labels } = req.body;
    const userId = (req as any).user.id;
    
    if (!Array.isArray(labels) || labels.length === 0) {
      return res.status(400).json({ error: 'Labels array is required' });
    }
    
    // Validate each label
    for (const label of labels) {
      if (!label.barcode || !label.productId || !label.productName || !label.productType) {
        return res.status(400).json({ error: 'Missing required fields in label data' });
      }
      
      // Check if barcode already exists
      const existing = await prisma.bagLabel.findUnique({
        where: { barcode: label.barcode }
      });
      
      if (existing) {
        return res.status(400).json({ error: `Barcode ${label.barcode} already exists` });
      }
    }
    
    // Create all labels
    const createdLabels = await prisma.$transaction(
      labels.map(label => 
        prisma.bagLabel.create({
          data: {
            barcode: label.barcode,
            productId: label.productId,
            productName: label.productName,
            productType: label.productType,
            unitsPerBag: label.unitsPerBag,
            bagNumber: label.bagNumber,
            workerId: label.workerId,
            productionDate: new Date(label.productionDate),
            printedBy: userId,
            notes: label.notes || null
          }
        })
      )
    );
    
    res.status(201).json({
      success: true,
      count: createdLabels.length,
      labels: createdLabels
    });
  } catch (error) {
    console.error('Error creating bag labels:', error);
    res.status(500).json({ error: 'Failed to create bag labels' });
  }
});

// Yorliq statusini yangilash (sotish, zaxiralash, shikastlanish)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, saleId, notes } = req.body;
    
    const validStatuses = ['IN_STOCK', 'SOLD', 'RESERVED', 'DAMAGED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updateData: any = { status };
    
    if (status === 'SOLD') {
      updateData.soldAt = new Date();
      if (saleId) {
        updateData.saleId = saleId;
      }
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    const updated = await prisma.bagLabel.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, label: updated });
  } catch (error) {
    console.error('Error updating bag label status:', error);
    res.status(500).json({ error: 'Failed to update bag label status' });
  }
});

// Yorliqni o'chirish
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.bagLabel.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Label deleted' });
  } catch (error) {
    console.error('Error deleting bag label:', error);
    res.status(500).json({ error: 'Failed to delete bag label' });
  }
});

// Statistika
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { productId, dateFrom, dateTo } = req.query;
    
    const where: any = {};
    
    if (productId) {
      where.productId = String(productId);
    }
    
    if (dateFrom || dateTo) {
      where.productionDate = {};
      if (dateFrom) {
        where.productionDate.gte = new Date(String(dateFrom));
      }
      if (dateTo) {
        where.productionDate.lte = new Date(String(dateTo));
      }
    }
    
    const [total, byStatus, byWorker, byProduct] = await Promise.all([
      prisma.bagLabel.count({ where }),
      prisma.bagLabel.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      }),
      prisma.bagLabel.groupBy({
        by: ['workerId'],
        where,
        _count: { id: true }
      }),
      prisma.bagLabel.groupBy({
        by: ['productId', 'productName', 'productType'],
        where,
        _count: { id: true }
      })
    ]);
    
    res.json({
      total,
      byStatus,
      byWorker,
      byProduct
    });
  } catch (error) {
    console.error('Error fetching bag label stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
