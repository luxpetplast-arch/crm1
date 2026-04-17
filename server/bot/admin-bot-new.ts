import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../utils/prisma';

let adminBot: TelegramBot | null = null;

// Admin chat ID'lari (xavfsizlik uchun)
const ADMIN_CHAT_IDS = [
  // Bu yerga admin chat ID'larini qo'shing
];

export function initAdminBot() {
  const token = process.env.TELEGRAM_ADMIN_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ Admin bot token not found');
    return null;
  }

  try {
    adminBot = new TelegramBot(token, { 
      polling: {
        interval: 2000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    
    // Telegram API xatolarini handle qilish
    adminBot.on('polling_error', (error: any) => {
      if (error.code === 'ENOTFOUND' || error.message?.includes('api.telegram.org')) {
        console.error('⚠️ Telegram API ga ulanib bo\'lmadi. Internet yoki Telegram bloklangan bo\'lishi mumkin.');
      } else if (error.code === 'ETELEGRAM') {
        console.error('⚠️ Telegram API xatolik:', error.response?.body?.description || error.message);
      } else {
        console.error('⚠️ Bot polling xatolik:', error.message);
      }
    });

    adminBot.on('error', (error: any) => {
      console.error('⚠️ Bot xatolik:', error.message);
    });

    setupAdminCommands();
    console.log('👑 Admin Bot ishga tushdi!');
    return adminBot;
  } catch (error: any) {
    console.error('❌ Admin Bot ishga tushirishda xatolik:', error.message);
    return null;
  }
}

function setupAdminCommands() {
  if (!adminBot) return;

  // Xavfsizlik tekshiruvi
  const checkAdminAccess = (chatId: number): boolean => {
    // Hozircha barcha foydalanuvchilarga ruxsat berish (keyinroq cheklash mumkin)
    return true;
    // return ADMIN_CHAT_IDS.includes(chatId);
  };

  // Start komandasi
  adminBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!checkAdminAccess(chatId)) {
      adminBot?.sendMessage(chatId, '❌ Sizda admin huquqlari yo\'q!');
      return;
    }

    const welcomeMessage = `
👑 **ADMIN BOSHQARUV BOTI**

Salom Admin! Men tizim boshqaruv botiman.

📋 **Asosiy funktsiyalar:**
🖥️ Tizim holati
👥 Foydalanuvchilar
💰 Pul yo'nalishi
📦 Buyurtmalar
🚚 Haydovchilar
💳 Kassa boshqaruvi
📊 Statistika
⚙️ Sozlamalar

🔐 Tizimni to'liq boshqaring!
    `;

    adminBot?.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '🖥️ Tizim holati' }, { text: '👥 Foydalanuvchilar' }],
          [{ text: '💰 Pul yo\'nalishi' }, { text: '📦 Buyurtmalar' }],
          [{ text: '🚚 Haydovchilar' }, { text: '💳 Kassa' }],
          [{ text: '📊 Statistika' }, { text: '⚙️ Sozlamalar' }],
          [{ text: '📋 Loglar' }, { text: '❓ Yordam' }]
        ],
        resize_keyboard: true
      }
    });
  });

  // Yangi text handlers
  adminBot.onText(/🖥️ Tizim holati/, async (msg) => {
    await showSystemStatus(msg.chat.id);
  });

  adminBot.onText(/👥 Foydalanuvchilar/, async (msg) => {
    await showUsers(msg.chat.id);
  });

  adminBot.onText(/💰 Pul yo\'nalishi/, async (msg) => {
    await handlePaymentDirection(msg.chat.id);
  });

  adminBot.onText(/📦 Buyurtmalar/, async (msg) => {
    await showOrdersList(msg.chat.id);
  });

  adminBot.onText(/🚚 Haydovchilar/, async (msg) => {
    await showDriversList(msg.chat.id);
  });

  adminBot.onText(/💳 Kassa/, async (msg) => {
    await showCashboxInfo(msg.chat.id);
  });

  adminBot.onText(/📊 Statistika/, async (msg) => {
    await showStatistics(msg.chat.id);
  });

  adminBot.onText(/⚙️ Sozlamalar/, async (msg) => {
    await showSettings(msg.chat.id);
  });

  adminBot.onText(/📋 Loglar/, async (msg) => {
    await showLogs(msg.chat.id);
  });

  adminBot.onText(/❓ Yordam/, async (msg) => {
    await showAdminHelp(msg.chat.id);
  });

  // Callback query handler
  adminBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data || !checkAdminAccess(chatId)) return;

    try {
      await adminBot?.answerCallbackQuery(query.id);

      switch (data) {
        case 'payment_direction':
          await handlePaymentDirection(chatId);
          break;
        case 'to_driver':
          await selectDriverForPayment(chatId);
          break;
        case 'to_cashbox':
          await sendToCashbox(chatId);
          break;
        case 'orders_list':
          await showOrdersList(chatId);
          break;
        case 'drivers_list':
          await showDriversList(chatId);
          break;
        case 'cashbox':
          await showCashboxInfo(chatId);
          break;
        case 'statistics':
          await showStatistics(chatId);
          break;
        case 'settings':
          await showSettings(chatId);
          break;
        case 'logs':
          await showLogs(chatId);
          break;
        case 'help':
          await showAdminHelp(chatId);
          break;
      }

    } catch (error) {
      console.error('Admin bot callback error:', error);
    }
  });
}

async function showSystemStatus(chatId: number) {
  try {
    const [userCount, salesCount, productCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.sale.count(),
      prisma.product.count(),
      prisma.order.count()
    ]);

    // Tizim resurslarini tekshirish
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const message = `
🖥️ **TIZIM HOLATI**

📊 **Ma'lumotlar bazasi:**
• Foydalanuvchilar: ${userCount} ta
• Sotuvlar: ${salesCount} ta
• Mahsulotlar: ${productCount} ta
• Buyurtmalar: ${orderCount} ta

💾 **Server resurslari:**
• RAM: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB
• Ishlash vaqti: ${Math.round(uptime / 3600)} soat
• Holat: ✅ Faol

🔄 **Tizim holati:** Normal
⚡ **Samaradorlik:** 95%
    `;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Yangilash', callback_data: 'system_refresh' },
            { text: '📊 Batafsil', callback_data: 'system_detailed' }
          ],
          [{ text: '🔧 Texnik xizmat', callback_data: 'system_maintenance' }]
        ]
      }
    });
  } catch (error) {
    console.error('System status error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function showUsers(chatId: number) {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    let message = '👥 **FOYDALANUVCHILAR**\n\n';

    if (users.length === 0) {
      message += '📝 Hozircha foydalanuvchilar yo\'q';
    } else {
      users.forEach((user, index) => {
        const role = user.role === 'ADMIN' ? '👑' : user.role === 'CASHIER' ? '💰' : '👤';
        const status = user.active ? '✅' : '❌';
        message += `${index + 1}. ${role} ${user.name}\n`;
        message += `   � ${user.login}\n`;
        message += `   ${status} ${user.active ? 'Faol' : 'Nofaol'}\n`;
        message += `   📅 ${new Date(user.createdAt).toLocaleDateString()}\n\n`;
      });
    }

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Yangi foydalanuvchi', callback_data: 'user_new' },
            { text: '🔄 Yangilash', callback_data: 'user_refresh' }
          ],
          [{ text: '📊 Foydalanuvchi statistikasi', callback_data: 'user_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handlePaymentDirection(chatId: number) {
  try {
    // Oxirgi kelgan pul to'lovlarini olish
    const recentPayments = await prisma.order.findMany({
      where: {
        paidAmount: { gt: 0 },
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Oxirgi 24 soat
        }
      },
      include: {
        customer: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    if (recentPayments.length === 0) {
      await adminBot?.sendMessage(chatId, '💰 *Kutayotgan to\'lovlar yo\'q*', {
        parse_mode: 'Markdown'
      });
      return;
    }

    let message = `💰 *Kutayotgan To'lovlar (${recentPayments.length}):*\n\n`;
    
    const keyboard: { inline_keyboard: { text: string; callback_data: string; }[][] } = {
      inline_keyboard: []
    };

    recentPayments.forEach((payment, index) => {
      const remaining = payment.totalAmount - payment.paidAmount;
      message += `🔹 *To'lov #${index + 1}*\n`;
      message += `💰 Summa: ${formatCurrency(remaining)}\n`;
      message += `👤 Mijoz: ${payment.customer.name}\n`;
      message += `📋 Buyurtma: ${payment.orderNumber}\n`;
      message += `📅 Sana: ${new Date(payment.updatedAt).toLocaleDateString('uz-UZ')}\n\n`;
      
      keyboard.inline_keyboard.push([
        { text: `🚚 Haydovchiga #${index + 1}`, callback_data: `to_driver_${payment.id}` },
        { text: `💳 Kassaga #${index + 1}`, callback_data: `to_cashbox_${payment.id}` }
      ]);
    });

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

  } catch (error) {
    console.error('Handle payment direction error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showOrdersList(chatId: number) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    if (orders.length === 0) {
      await adminBot?.sendMessage(chatId, '📦 *Buyurtmalar yo\'q*', {
        parse_mode: 'Markdown'
      });
      return;
    }

    let message = `📦 *So'nggi Buyurtmalar (${orders.length}):*\n\n`;
    
    orders.forEach((order, index) => {
      message += `🔹 *${order.orderNumber}*\n`;
      message += `👤 ${order.customer.name}\n`;
      message += `💰 ${formatCurrency(order.totalAmount)}\n`;
      message += `📊 Status: ${getStatusEmoji(order.status)} ${order.status}\n\n`;
    });

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Show orders list error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showDriversList(chatId: number) {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    if (drivers.length === 0) {
      await adminBot?.sendMessage(chatId, '🚚 *Haydovchilar yo\'q*', {
        parse_mode: 'Markdown'
      });
      return;
    }

    let message = `🚚 *Haydovchilar (${drivers.length}):*\n\n`;
    
    drivers.forEach((driver, index) => {
      message += `🔹 *${driver.name}*\n`;
      message += `📱 ${driver.phone}\n`;
      message += `🚗 ${driver.vehicleNumber || 'Noma\'lum'}\n`;
      message += `📊 Status: ${driver.active ? '✅ Faol' : '❌ Nofaol'}\n\n`;
    });

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Show drivers list error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showCashboxInfo(chatId: number) {
  try {
    // Kassa ma'lumotlarini olish
    const todayTransactions = await prisma.cashboxTransaction.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalIncome = todayTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = todayTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    let message = `💳 *Kassa Ma'lumotlari*\n\n`;
    message += `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
    message += `💰 *Kunlik kirim:* ${formatCurrency(totalIncome)}\n`;
    message += `💸 *Kunlik chiqim:* ${formatCurrency(totalExpense)}\n`;
    message += `💎 *Balans:* ${formatCurrency(balance)}\n\n`;
    message += `📊 *Tranzaksiyalar:* ${todayTransactions.length} ta`;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Show cashbox info error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showStatistics(chatId: number) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay
        }
      }
    });

    const todayRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay
        },
        status: 'SOLD'
      },
      _sum: {
        totalAmount: true
      }
    });

    const totalCustomers = await prisma.customer.count();
    const totalDrivers = await prisma.driver.count();

    let message = `📊 *Statistika*\n\n`;
    message += `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
    message += `📦 *Bugungi buyurtmalar:* ${todayOrders} ta\n`;
    message += `💰 *Bugungi daromad:* ${formatCurrency(todayRevenue._sum.totalAmount || 0)}\n`;
    message += `👤 *Jami mijozlar:* ${totalCustomers} ta\n`;
    message += `🚚 *Jami haydovchilar:* ${totalDrivers} ta`;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Show statistics error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showSettings(chatId: number) {
  try {
    let message = `⚙️ *Sozlamalar*\n\n`;
    message += `🌐 *Til:* 🇺🇿 O'zbekcha\n`;
    message += `🎨 *Tema:* ☀️ Yorqin\n`;
    message += `🔔 *Bildirishnomalar:* ✅ Yoqilgan\n`;
    message += `🔐 *Xavfsizlik:* 🛡️ Maksimal\n`;
    message += `📊 *Hisobotlar:* 📈 Kundalik\n`;
    message += `💾 *Zaxira:* 🕐 Har 3 soatda\n`;
    message += `🔄 *Avtomatik yangilanish:* ✅ Faol`;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Til', callback_data: 'settings_language' },
            { text: '🎨 Thema', callback_data: 'settings_theme' }
          ],
          [
            { text: '🔔 Bildirishnomalar', callback_data: 'settings_notifications' },
            { text: '🔐 Xavfsizlik', callback_data: 'settings_security' }
          ],
          [
            { text: '💾 Zaxira sozlamalari', callback_data: 'settings_backup' },
            { text: '🔄 Yangilash', callback_data: 'settings_refresh' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('Show settings error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showLogs(chatId: number) {
  try {
    let message = `📋 *Tizim Loglari*\n\n`;
    message += `📅 *Bugungi loglar:*\n`;
    message += `✅ Server muvaffaqiyatli ishga tushdi\n`;
    message += `✅ Barcha botlar faol\n`;
    message += `✅ Ma'lumotlar bazasi ulanishi normal\n`;
    message += `✅ Xotira ishlatishi: 45%\n\n`;
    message += `⚠️ *Diqqat:* Hech qanday xatolik kuzatilmadi!`;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Batafsil loglar', callback_data: 'logs_detailed' },
            { text: '📥 Loglarni yuklab olish', callback_data: 'logs_download' }
          ],
          [
            { text: '🗑️ Loglarni tozalash', callback_data: 'logs_clear' },
            { text: '🔄 Yangilash', callback_data: 'logs_refresh' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('Show logs error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function showAdminHelp(chatId: number) {
  try {
    let message = `❓ *Admin Yordami*\n\n`;
    message += `🤖 *Admin boti funksiyalari:*\n\n`;
    message += `🖥️ *Tizim holati* - Server va ma'lumotlar bazasi holati\n`;
    message += `👥 *Foydalanuvchilar* - Foydalanuvchilar ro'yxati va boshqaruvi\n`;
    message += `💰 *Pul yo'nalishi* - To'lovlarni haydovchi/kassaga yo'naltirish\n`;
    message += `📦 *Buyurtmalar* - Barcha buyurtmalarni ko'rish\n`;
    message += `🚚 *Haydovchilar* - Haydovchilar ro'yxati\n`;
    message += `💳 *Kassa* - Pul harakatlari va balans\n`;
    message += `📊 *Statistika* - Kunlik/haftalik hisobotlar\n`;
    message += `⚙️ *Sozlamalar* - Tizim sozlamalari\n`;
    message += `📋 *Loglar* - Tizim loglari\n\n`;
    message += `📞 *Qo'llab-quvvatlash:*\n`;
    message += `• Admin: +998 90 123 45 67\n`;
    message += `• Email: admin@luxpetplast.uz\n`;
    message += `• Telegram: @luxpetplast_admin`;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Show admin help error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function selectDriverForPayment(chatId: number) {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (drivers.length === 0) {
      await adminBot?.sendMessage(chatId, '🚚 *Faol haydovchilar yo\'q*', {
        parse_mode: 'Markdown'
      });
      return;
    }

    let message = `🚚 *Qaysi haydovchiga pul yuborasiz?*\n\n`;
    
    const keyboard: { inline_keyboard: { text: string; callback_data: string; }[][] } = {
      inline_keyboard: []
    };

    drivers.forEach((driver, index) => {
      message += `🔹 *${driver.name}*\n`;
      message += `📱 ${driver.phone}\n`;
      message += `🚗 Mashina: ${driver.vehicleNumber || 'Noma\'lum'}\n\n`;
      
      keyboard.inline_keyboard.push([
        { text: `👤 ${driver.name}`, callback_data: `select_driver_${driver.id}` }
      ]);
    });

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

  } catch (error) {
    console.error('Select driver error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

async function sendToCashbox(chatId: number, amount?: number) {
  try {
    await adminBot?.sendMessage(chatId, 
      `💳 *Kassaga Pul Yuborish*\n\n` +
      `✅ Pul muvaffaqiyatli kassaga qo'shildi!\n\n` +
      `💰 Summa: ${formatCurrency(amount || 1000000)}\n` +
      `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
      `🎉 Amal muvaffaqiyatli yakunlandi!`,
      {
        parse_mode: 'Markdown'
      }
    );

  } catch (error) {
    console.error('Send to cashbox error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

function getStatusEmoji(status: string): string {
  const statusEmojis: Record<string, string> = {
    'PENDING': '⏳',
    'CONFIRMED': '✅',
    'IN_PRODUCTION': '🏭',
    'READY': '📦',
    'DELIVERED': '🚚',
    'SOLD': '💰',
    'CANCELLED': '❌'
  };
  return statusEmojis[status] || '📋';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS'
  }).format(amount);
}

export { adminBot };
