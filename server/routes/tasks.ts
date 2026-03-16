import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        createdBy: req.user!.id,
      },
    });
    res.json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

router.get('/my-tasks', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedTo: req.user!.id },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch my tasks' });
  }
});

export default router;