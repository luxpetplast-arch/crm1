import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { OrderWorkflow } from '../services/order-workflow';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Main production endpoint (for test compatibility)
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Get production error:', error);
    res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

router.post('/orders', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const { productId, targetQuantity, plannedDate, shift, supervisorId, notes } = req.body;
    
    const orderNumber = `PRD-${Date.now()}`;
    
    const order = await prisma.productionOrder.create({
      data: {
        orderNumber,
        productId,
        targetQuantity,
        plannedDate: new Date(plannedDate),
        shift,
        supervisorId,
        notes,
      }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create production order' });
  }
});

router.put('/orders/:id/status', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req, res) => {
  try {
    const { status, actualQuantity } = req.body;
    const updateData: any = { status };

    if (status === 'IN_PROGRESS') {
      updateData.startedDate = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedDate = new Date();
      
      if (actualQuantity) {
        updateData.actualQuantity = actualQuantity;
      }
      
      // Update product stock when production is completed
      const order = await prisma.productionOrder.findUnique({
        where: { id: req.params.id },
      });
      
      if (order) {
        await prisma.product.update({
          where: { id: order.productId },
          data: { currentStock: { increment: actualQuantity || order.targetQuantity } },
        });

        // Workflow'ga ishlab chiqarish tugaganini xabar berish
        await OrderWorkflow.onProductionCompleted(req.params.id);
      }
    }

    const updatedOrder = await prisma.productionOrder.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update production order status' });
  }
});

export default router;