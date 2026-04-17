import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { botManager } from '../bot/bot-manager';

const router = Router();

router.use(authenticate);

// Barcha mijozlar bilan chatlarni olish (oxirgi xabar bilan)
router.get('/conversations', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        telegramChatId: { not: null }
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            chatMessages: {
              where: {
                isRead: false,
                senderType: 'CUSTOMER'
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const conversations = customers.map(customer => ({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      telegramUsername: customer.telegramUsername,
      lastMessage: customer.chatMessages[0] || null,
      unreadCount: customer._count.chatMessages
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Bitta mijoz bilan chat tarixini olish
router.get('/conversations/:customerId/messages', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.customerChat.findMany({
      where: { customerId },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    // O'qilmagan xabarlarni o'qilgan deb belgilash
    await prisma.customerChat.updateMany({
      where: {
        customerId,
        senderType: 'CUSTOMER',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mijozga xabar yuborish
router.post('/:customerId/send', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    const { message, messageType = 'TEXT' } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin ID not found' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mijozni topish
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (!customer.telegramChatId) {
      return res.status(400).json({ error: 'Customer has no Telegram chat' });
    }

    // Xabarni saqlash
    const chatMessage = await prisma.customerChat.create({
      data: {
        customerId,
        adminId,
        message,
        messageType,
        senderType: 'ADMIN',
        isRead: true
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    // Mijozga Telegram orqali yuborish
    const customerBot = botManager.getBot('customer') || botManager.getBot('customer-premium');
    if (customerBot) {
      try {
        await customerBot.sendMessage(customer.telegramChatId, `
💬 **ADMIN XABARI**

${message}

---
📞 Javob berish uchun xabar yozing.
        `, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Failed to send Telegram message:', error);
      }
    }

    res.json(chatMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// O'qilmagan xabarlar sonini olish
router.get('/unread-count', async (req, res) => {
  try {
    const count = await prisma.customerChat.count({
      where: {
        senderType: 'CUSTOMER',
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Xabarni o'qilgan deb belgilash
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.customerChat.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json(message);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Barcha xabarlarni o'qilgan deb belgilash
router.put('/:customerId/read-all', async (req, res) => {
  try {
    const { customerId } = req.params;

    await prisma.customerChat.updateMany({
      where: {
        customerId,
        senderType: 'CUSTOMER',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Chat tarixini o'chirish
router.delete('/:customerId/clear', async (req, res) => {
  try {
    const { customerId } = req.params;

    await prisma.customerChat.deleteMany({
      where: { customerId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

export default router;
