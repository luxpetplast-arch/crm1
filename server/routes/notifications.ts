import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Bildirishnomalarni yuklashda xatolik' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: { 
        id,
        userId 
      },
      data: { read: true },
    });

    res.json({ message: 'Bildirishnoma o\'qilgan deb belgilandi' });
  } catch (error) {
    res.status(500).json({ error: 'Bildirishnomani yangilashda xatolik' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true },
    });

    res.json({ message: 'Barcha bildirishnomalar o\'qilgan deb belgilandi' });
  } catch (error) {
    res.status(500).json({ error: 'Bildirishnomalarni yangilashda xatolik' });
  }
});

// Create notification (internal use)
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, title, message, type, actionUrl } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info',
        actionUrl,
      },
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Bildirishnoma yaratishda xatolik' });
  }
});

// Helper function to create system notifications
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info',
  actionUrl?: string
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl,
      },
    });
  } catch (error) {
    console.error('Bildirishnoma yaratishda xatolik:', error);
  }
};

export default router;