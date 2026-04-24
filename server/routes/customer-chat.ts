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
          select: { name: true, login: true }
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
          select: { name: true, login: true }
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

// Chatni pin qilish
router.post('/:customerId/pin', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer with pin status (you may need to add isPinned field to customer model)
    // For now, we'll use a simple approach
    res.json({ success: true, isPinned: true });
  } catch (error) {
    console.error('Pin chat error:', error);
    res.status(500).json({ error: 'Failed to pin chat' });
  }
});

// Chatni archive qilish
router.post('/:customerId/archive', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer with archive status (you may need to add isArchived field to customer model)
    // For now, we'll use a simple approach
    res.json({ success: true, isArchived: true });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ error: 'Failed to archive chat' });
  }
});

// Xabarni tahrirlash
router.put('/messages/:messageId', async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const message = await prisma.customerChat.findFirst({
      where: {
        id: messageId,
        senderType: 'ADMIN'
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or cannot be edited' });
    }

    const updatedMessage = await prisma.customerChat.update({
      where: { id: messageId },
      data: {
        message: text?.trim() || '',
        isEdited: true,
        updatedAt: new Date()
      } as any
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Xabarni o'chirish
router.delete('/messages/:messageId', async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.customerChat.findFirst({
      where: {
        id: messageId,
        senderType: 'ADMIN'
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or cannot be deleted' });
    }

    await prisma.customerChat.delete({
      where: { id: messageId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Typing indicator
router.post('/:customerId/typing', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    const { isTyping } = req.body;

    // Update customer typing status (you may need to add typing status fields)
    // For now, we'll just return success
    res.json({ success: true, isTyping: isTyping || false });
  } catch (error) {
    console.error('Typing indicator error:', error);
    res.status(500).json({ error: 'Failed to set typing indicator' });
  }
});

// Online status
router.post('/:customerId/online', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    const { isOnline } = req.body;

    // Update customer online status (you may need to add online status fields)
    // For now, we'll just return success
    res.json({ success: true, isOnline: isOnline || false });
  } catch (error) {
    console.error('Online status error:', error);
    res.status(500).json({ error: 'Failed to set online status' });
  }
});

// Chat statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const totalConversations = await prisma.customer.count({
      where: {
        telegramChatId: { not: null }
      }
    });

    const totalMessages = await prisma.customerChat.count();

    const unreadMessages = await prisma.customerChat.count({
      where: {
        senderType: 'CUSTOMER',
        isRead: false
      }
    });

    const activeConversations = await prisma.customer.count({
      where: {
        telegramChatId: { not: null },
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    res.json({
      totalConversations,
      totalMessages,
      unreadMessages,
      activeConversations
    });
  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
});

export default router;
