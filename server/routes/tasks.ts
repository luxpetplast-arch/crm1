import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

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

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedDate = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (assignedTo) updateData.assignedTo = assignedTo;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
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