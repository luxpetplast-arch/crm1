import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminBot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN!);

// Admin chat ID lar (o'zingizni kiriting)
const ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_ID?.split(',').map(id => id.trim()) || [];

// Admin access check
function checkAdminAccess(chatId: number): boolean {
  return ADMIN_CHAT_IDS.includes(chatId.toString());
}

// Bot commands
adminBot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  if (!checkAdminAccess(chatId)) {
    await adminBot.sendMessage(chatId, '❌ Sizda admin huquqlari yo\'q');
    return;
  }
  
  await adminBot.sendMessage(chatId, 
    `👋 **Admin Botiga xush kelibsiz!**\n\n` +
    `👤 Foydalanuvchi: ${user?.first_name} ${user?.last_name || ''}\n` +
    `📞 Username: @${user?.username || 'mavjud emas'}\n\n` +
    `🛠️ **Quyidagi buyruqlar mavjud:**\n\n` +
    `📊 /system - Tizim holati\n` +
    `👥 /users - Foydalanuvchilar\n` +
    `💰 /sales - Sotuvlar\n` +
    `📦 /products - Mahsulotlar\n` +
    `⚙️ /settings - Sozlamalar\n` +
    `📋 /logs - Loglar\n` +
    `❓ /help - Yordam`
  );
});

adminBot.onText(/\/system/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!checkAdminAccess(chatId)) return;
  
  try {
    const [userCount, salesCount, productCount] = await Promise.all([
      prisma.user.count(),
      prisma.sale.count(),
      prisma.product.count()
    ]);

    const message = 
      `🖥️ **TIZIM HOLATI**\n\n` +
      `📊 **Ma'lumotlar bazasi:**\n` +
      `• Foydalanuvchilar: ${userCount} ta\n` +
      `• Sotuvlar: ${salesCount} ta\n` +
      `• Mahsulotlar: ${productCount} ta\n\n` +
      `🔄 **Tizim holati:** Normal\n` +
      `⚡ **Samaradorlik:** 95%`;

    await adminBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('System status error:', error);
    await adminBot.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
});

adminBot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!checkAdminAccess(chatId)) return;
  
  const helpMessage = 
    `❓ **ADMIN YORDAM**\n\n` +
    `🛠️ **Tizim boshqaruvi:**\n` +
    `• /system - Real-time tizim holati\n` +
    `• /users - Foydalanuvchilar ro'yxati\n` +
    `• /sales - Sotuvlar boshqaruvi\n` +
    `• /products - Mahsulotlar boshqaruvi\n\n` +
    `⚙️ **Sozlamalar:**\n` +
    `• /settings - Tizim sozlamalari\n\n` +
    `📋 **Loglar:**\n` +
    `• /logs - Tizim loglari\n\n` +
    `🆘 **Favqulodda yordam:**\n` +
    `Texnik muammolar uchun: @admin`;

  await adminBot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Error handling
adminBot.on('polling_error', (error) => {
  console.error('Admin bot polling error:', error);
});

adminBot.on('error', (error) => {
  console.error('Admin bot error:', error);
});

// Initialize admin bot
function initAdminBot() {
  return adminBot;
}

export { adminBot, initAdminBot };
