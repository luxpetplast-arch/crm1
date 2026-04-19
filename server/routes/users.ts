import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, password, role, login } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        login,
        password: hashedPassword,
        role: role || 'cashier',
        active: true,
      },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, password, role, active, login } = req.body;
    const data: any = { name, role, active, login };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        active: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
