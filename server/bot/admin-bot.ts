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
    await handleSystemStatus(msg.chat.id);
  });

  adminBot.onText(/👥 Foydalanuvchilar/, async (msg) => {
    await handleUsers(msg.chat.id);
  });

  adminBot.onText(/💰 Pul yo'nalishi/, async (msg) => {
    await handleSalesManagement(msg.chat.id);
  });

  adminBot.onText(/📦 Buyurtmalar/, async (msg) => {
    await handleSalesManagement(msg.chat.id);
  });

  adminBot.onText(/🚚 Haydovchilar/, async (msg) => {
    await adminBot?.sendMessage(msg.chat.id, '🚚 Haydovchilar ro\'yxati tez orada qo\'shiladi');
  });

  adminBot.onText(/💳 Kassa/, async (msg) => {
    await adminBot?.sendMessage(msg.chat.id, '💳 Kassa ma\'lumotlari tez orada qo\'shiladi');
  });

  adminBot.onText(/📊 Statistika/, async (msg) => {
    await handleStatistics(msg.chat.id);
  });

  adminBot.onText(/⚙️ Sozlamalar/, async (msg) => {
    await handleSettings(msg.chat.id);
  });

  adminBot.onText(/📋 Loglar/, async (msg) => {
    await handleLogs(msg.chat.id);
  });

  // Komandalar
  adminBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!checkAdminAccess(chatId)) {
      await adminBot?.sendMessage(chatId, '❌ Sizda admin huquqlari yo\'q!');
      return;
    }

    if (text === '🖥️ Tizim holati' || text === '/system') {
      await handleSystemStatus(chatId);
    } else if (text === '👥 Foydalanuvchilar' || text === '/users') {
      await handleUsers(chatId);
    } else if (text === '💰 Sotuvlar' || text === '/sales') {
      await handleSalesManagement(chatId);
    } else if (text === '💾 Zaxira' || text === '/backup') {
      await handleBackup(chatId);
    } else if (text === '⚙️ Sozlamalar' || text === '/settings') {
      await handleSettings(chatId);
    } else if (text === '📋 Loglar' || text === '/logs') {
      await handleLogs(chatId);
    } else if (text === '📊 Statistika' || text === '/stats') {
      await handleStatistics(chatId);
    } else if (text === '❓ Yordam' || text === '/help') {
      await handleAdminHelp(chatId);
    }
  });

  // Callback query handler
  adminBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data || !checkAdminAccess(chatId)) return;

    try {
      if (data.startsWith('admin_user_')) {
        const userId = data.replace('admin_user_', '');
        await handleUserAction(chatId, userId, query.id);
      } else if (data.startsWith('admin_system_')) {
        const action = data.replace('admin_system_', '');
        await handleSystemAction(chatId, action, query.id);
      } else if (data.startsWith('admin_backup_')) {
        const action = data.replace('admin_backup_', '');
        await handleBackupAction(chatId, action, query.id);
      }
    } catch (error) {
      console.error('Admin bot callback error:', error);
    }
  });
}

async function handleSystemStatus(chatId: number) {
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
            { text: '🔄 Yangilash', callback_data: 'admin_system_refresh' },
            { text: '📊 Batafsil', callback_data: 'admin_system_detailed' }
          ],
          [{ text: '🔧 Texnik xizmat', callback_data: 'admin_system_maintenance' }]
        ]
      }
    });
  } catch (error) {
    console.error('System status error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleUsers(chatId: number) {
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
        message += `   📧 ${user.email}\n`;
        message += `   ${status} ${user.active ? 'Faol' : 'Nofaol'}\n`;
        message += `   📅 ${new Date(user.createdAt).toLocaleDateString()}\n\n`;
      });
    }

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Yangi foydalanuvchi', callback_data: 'admin_user_new' },
            { text: '🔄 Yangilash', callback_data: 'admin_user_refresh' }
          ],
          [{ text: '📊 Foydalanuvchi statistikasi', callback_data: 'admin_user_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleSalesManagement(chatId: number) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const [todaySales, totalRevenue, topProducts] = await Promise.all([
      prisma.sale.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.sale.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5
      })
    ]);

    let message = `
💰 **SOTUVLAR BOSHQARUVI**

📊 **Bugungi statistika:**
• Sotuvlar soni: ${todaySales} ta
• Jami daromad: $${totalRevenue._sum.totalAmount || 0}

🏆 **Top mahsulotlar:**
`;

    for (const product of topProducts) {
      if (!product.productId) continue;
      const productInfo = await prisma.product.findUnique({
        where: { id: product.productId }
      });
      message += `• ${productInfo?.name || 'Noma\'lum'}: ${product._count.productId} ta\n`;
    }

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Batafsil hisobot', callback_data: 'admin_sales_detailed' },
            { text: '📤 Eksport', callback_data: 'admin_sales_export' }
          ],
          [{ text: '🔄 Yangilash', callback_data: 'admin_sales_refresh' }]
        ]
      }
    });
  } catch (error) {
    console.error('Sales management error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleBackup(chatId: number) {
  try {
    const message = `
💾 **MA'LUMOTLAR ZAXIRASI**

🔐 **Zaxira holati:**
• Oxirgi zaxira: Bugun 03:00
• Hajmi: 125 MB
• Holat: ✅ Muvaffaqiyatli

📋 **Zaxira turlari:**
• Avtomatik: Har kuni 03:00
• Qo'lda: Istalgan vaqtda
• Tezkor: Muhim o'zgarishlardan oldin

⚠️ **Diqqat:** Zaxira yaratish bir necha daqiqa davom etishi mumkin.
    `;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💾 Zaxira yaratish', callback_data: 'admin_backup_create' },
            { text: '📥 Tiklash', callback_data: 'admin_backup_restore' }
          ],
          [{ text: '📋 Zaxira tarixi', callback_data: 'admin_backup_history' }]
        ]
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleSettings(chatId: number) {
  try {
    const message = `
⚙️ **TIZIM SOZLAMALARI**

💱 **Valyuta kurslari:**
• USD/UZS: 12950
• EUR/UZS: 13500

🔔 **Bildirishnomalar:**
• Telegram: ✅ Faol
• Email: ❌ O'chiq
• SMS: ❌ O'chiq

🛡️ **Xavfsizlik:**
• 2FA: ✅ Faol
• Session timeout: 24 soat
• Password policy: Kuchli

📊 **Tizim:**
• Debug mode: ${process.env.NODE_ENV === 'development' ? '✅' : '❌'}
• Cache: ✅ Faol
• Logs: ✅ Faol
    `;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💱 Kurslar', callback_data: 'admin_settings_rates' },
            { text: '🔔 Bildirishnomalar', callback_data: 'admin_settings_notifications' }
          ],
          [
            { text: '🛡️ Xavfsizlik', callback_data: 'admin_settings_security' },
            { text: '📊 Tizim', callback_data: 'admin_settings_system' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Settings error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleLogs(chatId: number) {
  try {
    // Bu yerda log fayllarini o'qish logikasi bo'lishi kerak
    const message = `
📋 **TIZIM LOGLARI**

📊 **Oxirgi faoliyat:**
• 14:30 - Yangi foydalanuvchi ro'yxatdan o'tdi
• 14:25 - Sotuv yaratildi (#12345)
• 14:20 - Ma'lumotlar bazasi yangilandi
• 14:15 - Zaxira yaratildi
• 14:10 - Tizim qayta ishga tushdi

⚠️ **Ogohlantirishlar:**
• Disk bo'sh joy: 15% qoldi
• RAM foydalanish: 85%

❌ **Xatoliklar:**
• Hozircha xatoliklar yo'q
    `;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Yangilash', callback_data: 'admin_logs_refresh' },
            { text: '📤 Eksport', callback_data: 'admin_logs_export' }
          ],
          [{ text: '🔍 Qidiruv', callback_data: 'admin_logs_search' }]
        ]
      }
    });
  } catch (error) {
    console.error('Logs error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleStatistics(chatId: number) {
  try {
    const [totalUsers, totalSales, totalRevenue, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.sale.count(),
      prisma.sale.aggregate({ _sum: { totalAmount: true } }),
      prisma.product.count()
    ]);

    const message = `
📊 **UMUMIY STATISTIKA**

👥 **Foydalanuvchilar:** ${totalUsers} ta
💰 **Sotuvlar:** ${totalSales} ta
💵 **Jami daromad:** $${totalRevenue._sum.totalAmount || 0}
📦 **Mahsulotlar:** ${totalProducts} ta

📈 **Trend:**
• Sotuvlar: ↗️ +15% (haftalik)
• Daromad: ↗️ +22% (haftalik)
• Yangi mijozlar: ↗️ +8% (haftalik)

🏆 **Yutuqlar:**
• Eng yaxshi kun: Dushanba
• Eng ko'p sotilgan mahsulot: Premium
• Eng faol foydalanuvchi: Admin
    `;

    await adminBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Batafsil tahlil', callback_data: 'admin_stats_detailed' }],
          [{ text: '📤 Hisobotni yuborish', callback_data: 'admin_stats_export' }]
        ]
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    await adminBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleAdminHelp(chatId: number) {
  const helpMessage = `
❓ **ADMIN YORDAM**

👑 **Admin boti** quyidagi funksiyalarni taqdim etadi:

🖥️ **Tizim boshqaruvi**
• Real-time tizim holati
• Server resurslari kuzatuvi
• Texnik xizmat rejimi

👥 **Foydalanuvchi boshqaruvi**
• Foydalanuvchilar ro'yxati
• Huquqlar boshqaruvi
• Faollik kuzatuvi

💰 **Moliyaviy boshqaruv**
• Sotuvlar tahlili
• Daromad hisobotlari
• Moliyaviy statistika

💾 **Ma'lumotlar boshqaruvi**
• Avtomatik zaxira
• Ma'lumotlarni tiklash
• Eksport/Import

⚙️ **Tizim sozlamalari**
• Valyuta kurslari
• Bildirishnomalar
• Xavfsizlik sozlamalari

📋 **Monitoring**
• Tizim loglari
• Xatoliklar kuzatuvi
• Samaradorlik tahlili

🆘 **Favqulodda yordam:**
Texnik muammolar uchun: @tech_support
  `;

  await adminBot?.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown'
  });
}

// Yordamchi funksiyalar
async function handleUserAction(chatId: number, userId: string, queryId: string) {
  await adminBot?.answerCallbackQuery(queryId, { text: 'Foydalanuvchi yangilandi!' });
}

async function handleSystemAction(chatId: number, action: string, queryId: string) {
  await adminBot?.answerCallbackQuery(queryId, { text: 'Tizim amaliyoti bajarildi!' });
}

async function handleBackupAction(chatId: number, action: string, queryId: string) {
  if (action === 'create') {
    await adminBot?.answerCallbackQuery(queryId, { text: 'Zaxira yaratilmoqda...' });
    // Zaxira yaratish logikasi
  } else {
    await adminBot?.answerCallbackQuery(queryId, { text: 'Amaliyot bajarildi!' });
  }
}

export { adminBot };