import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendTelegramMessage } from '../utils/telegram';

const router = express.Router();
const prisma = new PrismaClient();

// Get all customer chats
router.get('/', async (req, res) => {
  try {
    // Get all customers with telegram chat ID
    const customers = await prisma.customer.findMany({
      where: {
        telegramChatId: {
          not: null
        }
      },
      select: {
        telegramChatId: true,
        name: true,
        phone: true
      }
    });

    // Get chat histories from database or bot
    const chats = [];
    
    for (const customer of customers) {
      if (!customer.telegramChatId) continue;
      
      try {
        // Get messages from bot or database
        const messages = await getChatHistory(customer.telegramChatId);
        
        if (messages.length > 0) {
          chats.push({
            customerTelegramId: customer.telegramChatId,
            customerName: customer.name,
            customerPhone: customer.phone,
            messages: messages,
            lastMessage: new Date(Math.max(...messages.map(m => new Date(m.timestamp).getTime()))),
            unreadCount: messages.filter(m => m.from === 'user' && !m.read).length
          });
        }
      } catch (error) {
        console.error(`Failed to get chat for ${customer.telegramChatId}:`, error);
      }
    }

    // Sort by last message time
    chats.sort((a, b) => b.lastMessage.getTime() - a.lastMessage.getTime());

    res.json(chats);
  } catch (error) {
    console.error('Failed to get customer chats:', error);
    res.status(500).json({ error: 'Failed to get customer chats' });
  }
});

// Get chat history for specific customer
router.get('/:telegramChatId', async (req, res) => {
  try {
    const { telegramChatId } = req.params;
    
    const messages = await getChatHistory(telegramChatId);
    
    res.json({
      customerTelegramId: telegramChatId,
      messages: messages
    });
  } catch (error) {
    console.error('Failed to get chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Send message to customer
router.post('/send-message', async (req, res) => {
  try {
    const { telegramChatId, message } = req.body;

    if (!telegramChatId || !message) {
      return res.status(400).json({ error: 'Telegram chat ID and message are required' });
    }

    // Send message via Telegram
    const success = await sendTelegramMessage(telegramChatId, message);

    if (success) {
      // Save message to database
      await saveMessage(telegramChatId, message, 'bot');
      
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat history helper function
async function getChatHistory(telegramChatId: string) {
  try {
    // Get customer by telegram chat ID
    const customer = await prisma.customer.findFirst({
      where: {
        telegramChatId: telegramChatId
      }
    });

    if (!customer) {
      return [];
    }

    // Get messages from database
    const dbMessages = await prisma.customerChat.findMany({
      where: {
        customerId: customer.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (dbMessages.length > 0) {
      return dbMessages.map(msg => ({
        id: msg.id,
        text: msg.message,
        from: msg.senderType.toLowerCase() as 'user' | 'bot',
        timestamp: msg.createdAt,
        customerName: customer.name,
        customerPhone: customer.phone,
        read: msg.isRead
      }));
    }

    // If no database messages, return empty array
    return [];
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return [];
  }
}

// Save message to database
async function saveMessage(telegramChatId: string, text: string, from: 'user' | 'bot', customerName?: string, customerPhone?: string) {
  try {
    // Get customer by telegram chat ID
    const customer = await prisma.customer.findFirst({
      where: {
        telegramChatId: telegramChatId
      }
    });

    if (!customer) {
      console.error('Customer not found for telegram chat ID:', telegramChatId);
      return;
    }

    await prisma.customerChat.create({
      data: {
        customerId: customer.id,
        message: text,
        senderType: from.toUpperCase(),
        messageType: 'TEXT',
        isRead: from === 'bot' // Mark bot messages as read
      }
    });
  } catch (error) {
    console.error('Failed to save message:', error);
  }
}

// Save incoming message from bot webhook
router.post('/webhook/telegram', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (message && message.text) {
      const telegramChatId = message.chat.id.toString();
      const text = message.text;
      
      // Get customer info
      const customer = await prisma.customer.findFirst({
        where: {
          telegramChatId: telegramChatId
        }
      });

      if (customer) {
        // Save message to database
        await saveMessage(
          telegramChatId,
          text,
          'user',
          customer.name,
          customer.phone
        );
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to handle webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
});

export default router;
