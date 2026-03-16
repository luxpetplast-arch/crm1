import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let bot: TelegramBot | null = null;

// Admin foydalanuvchilar (Telegram ID)
const ADMIN_IDS = new Set<number>();

export function initSuperBot() {
  if (!BOT_TOKEN) {
    console.warn('⚠️  Telegram bot token not configured');
    return null;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('🚀 SUPER BOT ishga tushdi!');
    setupCommands();
    setupCallbacks();
    startAutomatedTasks();
    return bot;
  } catch (error) {
    console.error('❌ Bot xatosi:', error);
    return null;
  }
}

function setupCommands() {
  if (!bot) return;

  // /start - Boshlash
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'Foydalanuvchi';
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'dashboard' },
          { text: '💰 Moliya', callback_data: 'finance' }
        ],
        [
          { text: '📦 Mahsulotlar', callback_data: 'products' },
          { text: '👥 Mijozlar', callback_data: 'customers' }
        ],
        [
          { text: '📈 Statistika', callback_data: 'stats' },
          { text: '⚙️ Sozlamalar', callback_data: 'settings' }
        ],
        [
          { text: '❓ Yordam', callback_data: 'help' }
        ]
      ]
    };

    const welcomeMsg = `
🎉 <b>Assalomu Aleykum, ${firstName}!</b>

<b>AzizTrades ERP Super Bot</b>ga xush kelibsiz! 🚀

Bu bot orqali siz:
✅ Biznes statistikasini ko'rishingiz
✅ Mahsulotlar va mijozlarni boshqarishingiz
✅ Moliyaviy hisobotlarni olishingiz
✅ Tezkor xabarlar olishingiz mumkin

Quyidagi tugmalardan birini tanlang:
    `.trim();

    await bot!.sendMessage(chatId, welcomeMsg, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // /dashboard - Asosiy ko'rsatkichlar
  bot.onText(/\/dashboard/, async (msg) => {
    await handleDashboard(msg.chat.id);
  });

  // /sales - Bugungi sotuvlar
  bot.onText(/\/sales/, async (msg) => {
    await handleSales(msg.chat.id);
  });

  // /products - Mahsulotlar
  bot.onText(/\/products/, async (msg) => {
    await handleProducts(msg.chat.id);
  });

  // /customers - Mijozlar
  bot.onText(/\/customers/, async (msg) => {
    await handleCustomers(msg.chat.id);
  });

  // /lowstock - Kam qolgan mahsulotlar
  bot.onText(/\/lowstock/, async (msg) => {
    await handleLowStock(msg.chat.id);
  });

  // /debts - Qarzlar
  bot.onText(/\/debts/, async (msg) => {
    await handleDebts(msg.chat.id);
  });

  // /report - Kunlik hisobot
  bot.onText(/\/report/, async (msg) => {
    await handleDailyReport(msg.chat.id);
  });

  // /help - Yordam
  bot.onText(/\/help/, async (msg) => {
    await handleHelp(msg.chat.id);
  });

  // /admin - Admin panel (faqat adminlar uchun)
  bot.onText(/\/admin/, async (msg) => {
    if (!ADMIN_IDS.has(msg.from!.id)) {
      await bot!.sendMessage(msg.chat.id, '❌ Sizda admin huquqi yo\'q!');
      return;
    }
    await handleAdmin(msg.chat.id);
  });

  // /balance - Kassa balansi
  bot.onText(/\/balance/, async (msg) => {
    await handleBalance(msg.chat.id);
  });

  // /history - Sotuvlar tarixi
  bot.onText(/\/history/, async (msg) => {
    await handleSalesHistory(msg.chat.id);
  });

  // /order - Buyurtma berish
  bot.onText(/\/order/, async (msg) => {
    await handleOrderStart(msg.chat.id);
  });

  // /mydebt - Mening qarzim (mijozlar uchun)
  bot.onText(/\/mydebt/, async (msg) => {
    await handleMyDebt(msg.chat.id, msg.from!.id);
  });

  // /myorders - Mening buyurtmalarim (mijozlar uchun)
  bot.onText(/\/myorders/, async (msg) => {
    await handleMyOrders(msg.chat.id, msg.from!.id);
  });
}

function setupCallbacks() {
  if (!bot) return;

  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;

    await bot!.answerCallbackQuery(query.id);

    switch (data) {
      case 'dashboard':
        await handleDashboard(chatId);
        break;
      case 'finance':
        await handleFinance(chatId);
        break;
      case 'products':
        await handleProducts(chatId);
        break;
      case 'customers':
        await handleCustomers(chatId);
        break;
      case 'stats':
        await handleStats(chatId);
        break;
      case 'settings':
        await handleSettings(chatId);
        break;
      case 'help':
        await handleHelp(chatId);
        break;
      case 'lowstock':
        await handleLowStock(chatId);
        break;
      case 'debts':
        await handleDebts(chatId);
        break;
      case 'report':
        await handleDailyReport(chatId);
        break;
      case 'balance':
        await handleBalance(chatId);
        break;
      case 'history':
        await handleSalesHistory(chatId);
        break;
      case 'order':
        await handleOrderStart(chatId);
        break;
    }
  });
}

// Dashboard - Asosiy ko'rsatkichlar
async function handleDashboard(chatId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySales, totalCustomers, totalProducts, lowStockCount] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: today } } }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.count({ where: { currentStock: { lte: prisma.product.fields.minStockLimit } } })
    ]);

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + (s.totalAmount - (s.quantity * (s.product?.productionCost || 0))), 0);

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Batafsil Statistika', callback_data: 'stats' },
          { text: '💰 Moliya', callback_data: 'finance' }
        ],
        [
          { text: '⚠️ Kam Mahsulotlar', callback_data: 'lowstock' },
          { text: '💳 Qarzlar', callback_data: 'debts' }
        ]
      ]
    };

    const message = `
📊 <b>DASHBOARD - Bugungi Ko'rsatkichlar</b>

📅 Sana: ${today.toLocaleDateString('uz-UZ')}

💰 <b>Moliya:</b>
├ Daromad: <b>${todayRevenue.toFixed(2)} USD</b>
├ Foyda: <b>${todayProfit.toFixed(2)} USD</b>
└ Sotuvlar: <b>${todaySales.length} ta</b>

📦 <b>Mahsulotlar:</b>
├ Jami: <b>${totalProducts} ta</b>
└ Kam qolgan: <b>${lowStockCount} ta</b> ${lowStockCount > 0 ? '⚠️' : '✅'}

👥 <b>Mijozlar:</b>
└ Jami: <b>${totalCustomers} ta</b>

${lowStockCount > 0 ? '\n⚠️ <b>DIQQAT:</b> Ba\'zi mahsulotlar tugamoqda!' : ''}
    `.trim();

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Moliya - Moliyaviy hisobot
async function handleFinance(chatId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todaySales, weekSales, expenses] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: today } } }),
      prisma.sale.findMany({ where: { createdAt: { gte: weekAgo } } }),
      prisma.expense.findMany({ where: { createdAt: { gte: weekAgo } } })
    ]);

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const weekRevenue = weekSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const weekExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const weekProfit = weekRevenue - weekExpenses;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📈 Batafsil Hisobot', callback_data: 'report' },
          { text: '🔙 Orqaga', callback_data: 'dashboard' }
        ]
      ]
    };

    const message = `
💰 <b>MOLIYAVIY HISOBOT</b>

📅 <b>Bugun:</b>
└ Daromad: <b>${todayRevenue.toFixed(2)} USD</b>

📊 <b>Haftalik (7 kun):</b>
├ Daromad: <b>${weekRevenue.toFixed(2)} USD</b>
├ Xarajatlar: <b>${weekExpenses.toFixed(2)} USD</b>
├ Foyda: <b>${weekProfit.toFixed(2)} USD</b>
└ Foyda marjasi: <b>${weekRevenue > 0 ? ((weekProfit / weekRevenue) * 100).toFixed(1) : 0}%</b>

${weekProfit > 0 ? '✅ Foydada' : '⚠️ Zararli'}
    `.trim();

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Mahsulotlar ro'yxati
async function handleProducts(chatId: number) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { currentStock: 'asc' },
      take: 10
    });

    if (products.length === 0) {
      await bot!.sendMessage(chatId, '📦 Mahsulotlar topilmadi!');
      return;
    }

    let message = '📦 <b>MAHSULOTLAR RO\'YXATI</b>\n\n';

    products.forEach((p, i) => {
      const stockStatus = p.currentStock <= p.minStockLimit ? '⚠️' : 
                         p.currentStock >= p.optimalStock ? '✅' : '📊';
      
      message += `${i + 1}. <b>${p.name}</b>\n`;
      message += `   ${stockStatus} Zaxira: ${p.currentStock} qop\n`;
      message += `   💵 Narx: ${p.pricePerBag} USD/qop\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⚠️ Kam Mahsulotlar', callback_data: 'lowstock' },
          { text: '🔙 Orqaga', callback_data: 'dashboard' }
        ]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Mijozlar ro'yxati
async function handleCustomers(chatId: number) {
  try {
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { sales: true } } },
      orderBy: { debt: 'desc' },
      take: 10
    });

    if (customers.length === 0) {
      await bot!.sendMessage(chatId, '👥 Mijozlar topilmadi!');
      return;
    }

    let message = '👥 <b>MIJOZLAR RO\'YXATI</b>\n\n';

    customers.forEach((c, i) => {
      const debtStatus = c.debt > 0 ? '💳' : '✅';
      
      message += `${i + 1}. <b>${c.name}</b>\n`;
      message += `   📞 ${c.phone}\n`;
      message += `   ${debtStatus} Qarz: ${c.debt.toFixed(2)} USD\n`;
      message += `   📊 Sotuvlar: ${c._count.sales} ta\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 Qarzlar', callback_data: 'debts' },
          { text: '🔙 Orqaga', callback_data: 'dashboard' }
        ]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Kam qolgan mahsulotlar
async function handleLowStock(chatId: number) {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStockLimit
        }
      },
      orderBy: { currentStock: 'asc' }
    });

    if (lowStockProducts.length === 0) {
      await bot!.sendMessage(chatId, '✅ Barcha mahsulotlar yetarli miqdorda!');
      return;
    }

    let message = '⚠️ <b>KAM QOLGAN MAHSULOTLAR</b>\n\n';

    lowStockProducts.forEach((p, i) => {
      const urgency = p.currentStock === 0 ? '🔴' : 
                     p.currentStock < p.minStockLimit / 2 ? '🟠' : '🟡';
      
      message += `${urgency} ${i + 1}. <b>${p.name}</b>\n`;
      message += `   Zaxira: <b>${p.currentStock}</b> qop\n`;
      message += `   Minimal: ${p.minStockLimit} qop\n`;
      message += `   Optimal: ${p.optimalStock} qop\n\n`;
    });

    message += '\n💡 <b>Tavsiya:</b> Ushbu mahsulotlarni tezda buyurtma qiling!';

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Qarzlar ro'yxati
async function handleDebts(chatId: number) {
  try {
    const debtors = await prisma.customer.findMany({
      where: { debt: { gt: 0 } },
      orderBy: { debt: 'desc' }
    });

    if (debtors.length === 0) {
      await bot!.sendMessage(chatId, '✅ Qarzlar yo\'q!');
      return;
    }

    const totalDebt = debtors.reduce((sum, c) => sum + c.debt, 0);

    let message = '💳 <b>QARZLAR RO\'YXATI</b>\n\n';
    message += `💰 Jami qarz: <b>${totalDebt.toFixed(2)} USD</b>\n\n`;

    debtors.forEach((c, i) => {
      const urgency = c.debt > 1000 ? '🔴' : c.debt > 500 ? '🟠' : '🟡';
      
      message += `${urgency} ${i + 1}. <b>${c.name}</b>\n`;
      message += `   📞 ${c.phone}\n`;
      message += `   💳 Qarz: <b>${c.debt.toFixed(2)} USD</b>\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Bugungi sotuvlar
async function handleSales(chatId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: today } },
      include: { customer: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (sales.length === 0) {
      await bot!.sendMessage(chatId, '📊 Bugun hali sotuvlar yo\'q!');
      return;
    }

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    let message = '📊 <b>BUGUNGI SOTUVLAR</b>\n\n';
    message += `💰 Jami: <b>${totalRevenue.toFixed(2)} USD</b>\n`;
    message += `📦 Sotuvlar: <b>${sales.length} ta</b>\n\n`;

    sales.forEach((s, i) => {
      message += `${i + 1}. <b>${s.customer?.name || 'Noma\'lum'}</b>\n`;
      message += `   📦 ${s.product?.name || 'Mahsulot'} - ${s.quantity} qop\n`;
      message += `   💵 ${s.totalAmount.toFixed(2)} USD\n\n`;
    });

    await bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Statistika
async function handleStats(chatId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [monthSales, monthExpenses, totalCustomers, activeCustomers] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: monthAgo } } }),
      prisma.expense.findMany({ where: { createdAt: { gte: monthAgo } } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { sales: { some: { createdAt: { gte: monthAgo } } } } })
    ]);

    const monthRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const monthExpensesTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthProfit = monthRevenue - monthExpensesTotal;

    const message = `
📈 <b>OYLIK STATISTIKA (30 kun)</b>

💰 <b>Moliya:</b>
├ Daromad: <b>${monthRevenue.toFixed(2)} USD</b>
├ Xarajatlar: <b>${monthExpensesTotal.toFixed(2)} USD</b>
├ Foyda: <b>${monthProfit.toFixed(2)} USD</b>
└ Foyda marjasi: <b>${monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100).toFixed(1) : 0}%</b>

📊 <b>Sotuvlar:</b>
├ Jami: <b>${monthSales.length} ta</b>
└ O'rtacha kunlik: <b>${(monthSales.length / 30).toFixed(1)} ta</b>

👥 <b>Mijozlar:</b>
├ Jami: <b>${totalCustomers} ta</b>
└ Faol: <b>${activeCustomers} ta</b>

${monthProfit > 0 ? '✅ Biznes foydada!' : '⚠️ Xarajatlarni kamaytiring!'}
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Kunlik hisobot
async function handleDailyReport(chatId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [sales, expenses, lowStock, debtors] = await Promise.all([
      prisma.sale.findMany({ 
        where: { createdAt: { gte: today } },
        include: { product: true }
      }),
      prisma.expense.findMany({ where: { createdAt: { gte: today } } }),
      prisma.product.count({ where: { currentStock: { lte: prisma.product.fields.minStockLimit } } }),
      prisma.customer.count({ where: { debt: { gt: 0 } } })
    ]);

    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - expensesTotal;

    const message = `
📋 <b>KUNLIK HISOBOT</b>

📅 Sana: ${today.toLocaleDateString('uz-UZ')}

💰 <b>Moliya:</b>
├ Daromad: <b>${revenue.toFixed(2)} USD</b>
├ Xarajatlar: <b>${expensesTotal.toFixed(2)} USD</b>
└ Foyda: <b>${profit.toFixed(2)} USD</b>

📊 <b>Sotuvlar:</b>
└ Jami: <b>${sales.length} ta</b>

⚠️ <b>Ogohlantirishlar:</b>
├ Kam mahsulotlar: <b>${lowStock} ta</b>
└ Qarzli mijozlar: <b>${debtors} ta</b>

${profit > 0 ? '✅ Yaxshi kun!' : '⚠️ Xarajatlar ko\'p!'}
    `.trim();

    await bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Sozlamalar
async function handleSettings(chatId: number) {
  const message = `
⚙️ <b>SOZLAMALAR</b>

<b>Mavjud sozlamalar:</b>
• Bildirishnomalar: Yoqilgan ✅
• Kunlik hisobot: Yoqilgan ✅
• Kam mahsulot ogohlantirish: Yoqilgan ✅

<b>Buyruqlar:</b>
/dashboard - Asosiy panel
/sales - Bugungi sotuvlar
/products - Mahsulotlar
/customers - Mijozlar
/lowstock - Kam mahsulotlar
/debts - Qarzlar
/report - Kunlik hisobot
/help - Yordam
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
    ]
  };

  await bot!.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

// Yordam
async function handleHelp(chatId: number) {
  const message = `
❓ <b>YORDAM</b>

<b>📱 Asosiy Buyruqlar:</b>
/start - Botni boshlash
/dashboard - Asosiy panel
/sales - Bugungi sotuvlar
/products - Mahsulotlar ro'yxati
/customers - Mijozlar ro'yxati

<b>📊 Hisobotlar:</b>
/lowstock - Kam qolgan mahsulotlar
/debts - Qarzlar ro'yxati
/report - Kunlik hisobot

<b>⚙️ Boshqalar:</b>
/settings - Sozlamalar
/help - Bu yordam xabari

<b>💡 Maslahatlar:</b>
• Har kuni /report buyrug'i bilan kunlik hisobotni ko'ring
• /lowstock bilan mahsulotlarni kuzatib boring
• /debts bilan qarzlarni nazorat qiling

📞 <b>Aloqa:</b> +998901234567
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
    ]
  };

  await bot!.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

// Admin panel
async function handleAdmin(chatId: number) {
  const message = `
👑 <b>ADMIN PANEL</b>

<b>Tizim ma'lumotlari:</b>
• Bot versiyasi: 2.0
• Status: Faol ✅

<b>Admin buyruqlari:</b>
/broadcast - Hammaga xabar yuborish
/stats - To'liq statistika
/backup - Ma'lumotlar zaxirasi

<b>Foydalanuvchilar:</b>
• Jami: Hisoblash...
• Faol: Hisoblash...
  `.trim();

  await bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
}

// Kassa balansi
async function handleBalance(chatId: number) {
  try {
    const transactions = await prisma.cashboxTransaction.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    // Bugungi tranzaksiyalar
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = transactions.filter(t => t.createdAt >= today);
    const todayIncome = todayTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = todayTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Batafsil Tarix', callback_data: 'history' },
          { text: '🔙 Orqaga', callback_data: 'dashboard' }
        ]
      ]
    };

    const message = `
💰 <b>KASSA BALANSI</b>

📊 <b>Umumiy:</b>
├ Kirim: <b>${income.toFixed(2)} USD</b>
├ Chiqim: <b>${expense.toFixed(2)} USD</b>
└ Balans: <b>${balance.toFixed(2)} USD</b>

📅 <b>Bugun:</b>
├ Kirim: <b>${todayIncome.toFixed(2)} USD</b>
├ Chiqim: <b>${todayExpense.toFixed(2)} USD</b>
└ Farq: <b>${(todayIncome - todayExpense).toFixed(2)} USD</b>

${balance > 0 ? '✅ Kassa musbat' : '⚠️ Kassa manfiy'}
    `.trim();

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Sotuvlar tarixi
async function handleSalesHistory(chatId: number) {
  try {
    const sales = await prisma.sale.findMany({
      include: { customer: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (sales.length === 0) {
      await bot!.sendMessage(chatId, '📊 Sotuvlar tarixi bo\'sh!');
      return;
    }

    let message = '📊 <b>SOTUVLAR TARIXI</b>\n\n';
    message += `<i>Oxirgi 10 ta sotuv:</i>\n\n`;

    sales.forEach((s, i) => {
      const date = s.createdAt.toLocaleDateString('uz-UZ');
      const status = s.paymentStatus === 'PAID' ? '✅' : 
                    s.paymentStatus === 'PARTIAL' ? '⚠️' : '❌';
      
      message += `${i + 1}. ${status} <b>${s.customer?.name || 'Noma\'lum'}</b>\n`;
      message += `   📦 ${s.product?.name || 'Mahsulot'} - ${s.quantity} qop\n`;
      message += `   💵 ${s.totalAmount.toFixed(2)} USD\n`;
      message += `   📅 ${date}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Orqaga', callback_data: 'dashboard' }]
      ]
    };

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Buyurtma berish boshlash
async function handleOrderStart(chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📦 Mahsulotlar ro\'yxati', callback_data: 'products' }
      ],
      [
        { text: '📞 Telefon orqali', url: 'tel:+998901234567' }
      ],
      [
        { text: '🔙 Orqaga', callback_data: 'dashboard' }
      ]
    ]
  };

  const message = `
📦 <b>BUYURTMA BERISH</b>

Buyurtma berish uchun quyidagi usullardan birini tanlang:

1️⃣ <b>Mahsulotlar ro'yxati</b>
   Mavjud mahsulotlarni ko'ring va tanlang

2️⃣ <b>Telefon orqali</b>
   Bizga qo'ng'iroq qiling: +998901234567

3️⃣ <b>Sayt orqali</b>
   https://aziztrades.com/orders

💡 <b>Eslatma:</b> Buyurtmangiz 24 soat ichida ko'rib chiqiladi.
  `.trim();

  await bot!.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

// Mijozning qarzi
async function handleMyDebt(chatId: number, telegramId: number) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { telegramChatId: telegramId.toString() }
    });

    if (!customer) {
      await bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz! /start buyrug\'ini yuboring.');
      return;
    }

    const sales = await prisma.sale.findMany({
      where: { 
        customerId: customer.id,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] }
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    const message = `
💳 <b>MENING QARZIM</b>

👤 Mijoz: <b>${customer.name}</b>

💰 Jami qarz: <b>${customer.debt.toFixed(2)} USD</b>

${sales.length > 0 ? `\n📋 <b>To'lanmagan sotuvlar:</b>\n` : ''}
${sales.map((s, i) => `
${i + 1}. ${s.product?.name || 'Mahsulot'}
   ├ Miqdor: ${s.quantity} qop
   ├ Jami: ${s.totalAmount.toFixed(2)} USD
   ├ To'langan: ${s.paidAmount.toFixed(2)} USD
   └ Qolgan: ${(s.totalAmount - s.paidAmount).toFixed(2)} USD
`).join('\n')}

${customer.debt > 0 ? '\n💡 Iltimos, qarzingizni to\'lang!\n📞 Aloqa: +998901234567' : '✅ Qarzingiz yo\'q!'}
    `.trim();

    await bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

// Mijozning buyurtmalari
async function handleMyOrders(chatId: number, telegramId: number) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { telegramChatId: telegramId.toString() }
    });

    if (!customer) {
      await bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz! /start buyrug\'ini yuboring.');
      return;
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { 
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (orders.length === 0) {
      await bot!.sendMessage(chatId, '📦 Buyurtmalaringiz yo\'q!');
      return;
    }

    let message = '📦 <b>MENING BUYURTMALARIM</b>\n\n';

    orders.forEach((order, i) => {
      const statusEmoji = order.status === 'DELIVERED' ? '✅' :
                         order.status === 'IN_PRODUCTION' ? '🔄' :
                         order.status === 'PENDING' ? '⏳' : '📦';
      
      message += `${i + 1}. ${statusEmoji} <b>Buyurtma #${order.orderNumber}</b>\n`;
      message += `   📅 ${order.createdAt.toLocaleDateString('uz-UZ')}\n`;
      message += `   💰 ${order.totalAmount.toFixed(2)} USD\n`;
      message += `   📊 Status: ${getOrderStatusText(order.status)}\n\n`;
    });

    await bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    await bot!.sendMessage(chatId, '❌ Xatolik yuz berdi!');
  }
}

function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Kutilmoqda',
    'CONFIRMED': 'Tasdiqlangan',
    'IN_PRODUCTION': 'Ishlab chiqarilmoqda',
    'READY': 'Tayyor',
    'DELIVERED': 'Yetkazilgan',
    'CANCELLED': 'Bekor qilingan'
  };
  return statusMap[status] || status;
}

// Xabar yuborish funksiyalari
export async function sendLowStockAlert(product: any) {
  if (!bot) return;

  const message = `
⚠️ <b>KAM MAHSULOT OGOHLANTIRISH!</b>

📦 Mahsulot: <b>${product.name}</b>
📊 Zaxira: <b>${product.currentStock} qop</b>
⚡ Minimal: ${product.minStockLimit} qop

💡 Tezda buyurtma bering!
  `.trim();

  // Barcha adminlarga yuborish
  for (const adminId of ADMIN_IDS) {
    try {
      await bot.sendMessage(adminId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error(`Failed to send to admin ${adminId}:`, error);
    }
  }
}

export async function sendSaleNotification(sale: any, customer: any, product: any) {
  if (!bot) return;

  const message = `
🎉 <b>YANGI SOTUV!</b>

👤 Mijoz: <b>${customer.name}</b>
📦 Mahsulot: <b>${product.name}</b>
📊 Miqdor: ${sale.quantity} qop
💰 Summa: <b>${sale.totalAmount.toFixed(2)} USD</b>

${sale.paymentStatus === 'PAID' ? '✅ To\'liq to\'langan' : '⚠️ Qisman to\'langan'}
  `.trim();

  for (const adminId of ADMIN_IDS) {
    try {
      await bot.sendMessage(adminId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error(`Failed to send to admin ${adminId}:`, error);
    }
  }
}

export async function sendDailyReport() {
  if (!bot) return;

  for (const adminId of ADMIN_IDS) {
    try {
      await handleDailyReport(adminId);
    } catch (error) {
      console.error(`Failed to send daily report to ${adminId}:`, error);
    }
  }
}

export function addAdmin(telegramId: number) {
  ADMIN_IDS.add(telegramId);
  console.log(`✅ Admin qo'shildi: ${telegramId}`);
}

// ============ AVTOMATIK ESLATMALAR VA CHEKLAR ============

// Avtomatik vazifalarni boshlash
function startAutomatedTasks() {
  console.log('🤖 Avtomatik vazifalar ishga tushdi');
  
  // Har 1 soatda kam mahsulotlarni tekshirish
  setInterval(checkLowStockAndNotify, 60 * 60 * 1000);
  
  // Har kuni soat 9:00 da kunlik hisobot
  scheduleDailyReport();
  
  // Har kuni soat 18:00 da qarz eslatmalari
  scheduleDebtReminders();
  
  // Har 30 daqiqada mijozlarga chek yuborish (to'lanmagan sotuvlar uchun)
  setInterval(sendPendingInvoices, 30 * 60 * 1000);
}

// Kam mahsulotlarni tekshirish va xabar yuborish
async function checkLowStockAndNotify() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { currentStock: { lte: prisma.product.fields.minStockLimit } },
          { currentStock: 0 }
        ]
      }
    });

    if (lowStockProducts.length === 0) return;

    for (const product of lowStockProducts) {
      await sendLowStockAlert(product);
    }
  } catch (error) {
    console.error('❌ Kam mahsulot tekshiruvida xato:', error);
  }
}

// Kunlik hisobotni rejalashtirish (har kuni 9:00)
function scheduleDailyReport() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(9, 0, 0, 0);
  
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilReport = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendDailyReport();
    setInterval(sendDailyReport, 24 * 60 * 60 * 1000);
  }, timeUntilReport);
  
  console.log(`📅 Kunlik hisobot: ${scheduledTime.toLocaleString('uz-UZ')}`);
}

// Qarz eslatmalarini rejalashtirish (har kuni 18:00)
function scheduleDebtReminders() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(18, 0, 0, 0);
  
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilReminder = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendDebtReminders();
    setInterval(sendDebtReminders, 24 * 60 * 60 * 1000);
  }, timeUntilReminder);
  
  console.log(`💳 Qarz eslatmalari: ${scheduledTime.toLocaleString('uz-UZ')}`);
}

// Qarz eslatmalarini yuborish
async function sendDebtReminders() {
  if (!bot) return;
  
  try {
    const debtors = await prisma.customer.findMany({
      where: { 
        debt: { gt: 0 },
        telegramChatId: { not: null },
        notificationsEnabled: true
      }
    });

    for (const customer of debtors) {
      if (!customer.telegramChatId) continue;

      // Eslatma kunlarini tekshirish
      const daysSinceLastPayment = customer.lastPayment 
        ? Math.floor((Date.now() - customer.lastPayment.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceLastPayment >= customer.debtReminderDays) {
        const message = `
🔔 <b>QARZ ESLATMASI</b>

Hurmatli <b>${customer.name}</b>,

Sizning qarzingiz:
💳 <b>${customer.debt.toFixed(2)} USD</b>

📅 Oxirgi to'lov: ${customer.lastPayment ? customer.lastPayment.toLocaleDateString('uz-UZ') : 'Yo\'q'}

Iltimos, qarzingizni to'lang.

📞 Aloqa: +998901234567
        `.trim();

        try {
          await bot.sendMessage(parseInt(customer.telegramChatId), message, {
            parse_mode: 'HTML'
          });
          console.log(`✅ Qarz eslatmasi yuborildi: ${customer.name}`);
        } catch (error) {
          console.error(`❌ ${customer.name} ga xabar yuborib bo'lmadi:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Qarz eslatmalarida xato:', error);
  }
}

// To'lanmagan sotuvlar uchun chek yuborish
async function sendPendingInvoices() {
  if (!bot) return;
  
  try {
    const pendingSales = await prisma.sale.findMany({
      where: {
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
        customer: {
          telegramChatId: { not: null },
          notificationsEnabled: true
        }
      },
      include: {
        customer: true,
        product: true,
        items: {
          include: {
            product: true
          }
        }
      },
      take: 50
    });

    for (const sale of pendingSales) {
      if (!sale.customer.telegramChatId) continue;

      // Chek yaratish
      const invoice = await generateInvoice(sale);
      
      try {
        await bot.sendMessage(parseInt(sale.customer.telegramChatId), invoice, {
          parse_mode: 'HTML'
        });
        console.log(`✅ Chek yuborildi: ${sale.customer.name} - Sotuv #${sale.id}`);
      } catch (error) {
        console.error(`❌ ${sale.customer.name} ga chek yuborib bo'lmadi:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Chek yuborishda xato:', error);
  }
}

// Chek generatsiya qilish
async function generateInvoice(sale: any) {
  const customer = sale.customer;
  const items = sale.items && sale.items.length > 0 ? sale.items : [
    { product: sale.product, quantity: sale.quantity, pricePerBag: sale.pricePerBag, subtotal: sale.totalAmount }
  ];

  let invoice = `
🧾 <b>CHEK / INVOICE</b>

📅 Sana: ${sale.createdAt.toLocaleDateString('uz-UZ')}
🆔 Sotuv ID: #${sale.id.substring(0, 8)}

👤 <b>Mijoz:</b>
├ Ism: ${customer.name}
├ Telefon: ${customer.phone}
${customer.email ? `└ Email: ${customer.email}` : ''}

📦 <b>Mahsulotlar:</b>
`;

  items.forEach((item: any, index: number) => {
    invoice += `
${index + 1}. ${item.product.name}
   ├ Miqdor: ${item.quantity} qop
   ├ Narx: ${item.pricePerBag.toFixed(2)} USD/qop
   └ Jami: ${(item.quantity * item.pricePerBag).toFixed(2)} USD
`;
  });

  const remainingDebt = sale.totalAmount - sale.paidAmount;

  invoice += `
━━━━━━━━━━━━━━━━━━━━

💰 <b>To'lov ma'lumotlari:</b>
├ Jami summa: <b>${sale.totalAmount.toFixed(2)} USD</b>
├ To'langan: <b>${sale.paidAmount.toFixed(2)} USD</b>
└ Qolgan qarz: <b>${remainingDebt.toFixed(2)} USD</b>

${sale.paymentStatus === 'PAID' ? '✅ <b>TO\'LIQ TO\'LANGAN</b>' : 
  sale.paymentStatus === 'PARTIAL' ? '⚠️ <b>QISMAN TO\'LANGAN</b>' : 
  '❌ <b>TO\'LANMAGAN</b>'}

${remainingDebt > 0 ? `\n💡 Iltimos, qarzingizni to'lang!\n📞 Aloqa: +998901234567` : ''}

━━━━━━━━━━━━━━━━━━━━
🏢 <b>AzizTrades ERP</b>
Rahmat! 🙏
  `.trim();

  return invoice;
}

// Sotuv bo'lganda darhol chek yuborish
export async function sendInvoiceImmediately(saleId: string) {
  if (!bot) return;
  
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        product: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale || !sale.customer.telegramChatId || !sale.customer.notificationsEnabled) {
      return;
    }

    const invoice = await generateInvoice(sale);
    
    await bot.sendMessage(parseInt(sale.customer.telegramChatId), invoice, {
      parse_mode: 'HTML'
    });
    
    console.log(`✅ Chek darhol yuborildi: ${sale.customer.name} - Sotuv #${sale.id}`);
  } catch (error) {
    console.error('❌ Chek yuborishda xato:', error);
  }
}

// Mijozga maxsus xabar yuborish
export async function sendCustomMessage(customerId: string, message: string) {
  if (!bot) return;
  
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer || !customer.telegramChatId) {
      throw new Error('Mijozda Telegram ID yo\'q');
    }

    await bot.sendMessage(parseInt(customer.telegramChatId), message, {
      parse_mode: 'HTML'
    });
    
    console.log(`✅ Xabar yuborildi: ${customer.name}`);
    return true;
  } catch (error) {
    console.error('❌ Xabar yuborishda xato:', error);
    return false;
  }
}

// Yangi buyurtma kelganda adminlarga xabar yuborish
export async function sendNewOrderNotification(order: any, customer: any, items: any[]) {
  if (!bot) return;

  const itemsList = items.map((item, i) => 
    `${i + 1}. ${item.product?.name || 'Mahsulot'} - ${item.quantityBags} qop`
  ).join('\n   ');

  const message = `
🆕 <b>YANGI BUYURTMA!</b>

🆔 Buyurtma: <b>#${order.orderNumber}</b>

👤 <b>Mijoz:</b>
├ Ism: ${customer.name}
├ Telefon: ${customer.phone}
${customer.email ? `└ Email: ${customer.email}` : ''}

📦 <b>Mahsulotlar:</b>
   ${itemsList}

💰 Jami summa: <b>${order.totalAmount.toFixed(2)} USD</b>

📅 Kerakli sana: ${new Date(order.requestedDate).toLocaleDateString('uz-UZ')}

${order.notes ? `📝 Izoh: ${order.notes}\n` : ''}
⏳ Status: <b>Kutilmoqda</b>

💡 Buyurtmani tezda ko'rib chiqing!
  `.trim();

  // Barcha adminlarga yuborish
  for (const adminId of ADMIN_IDS) {
    try {
      await bot.sendMessage(adminId, message, { parse_mode: 'HTML' });
      console.log(`✅ Buyurtma xabari yuborildi admin ${adminId} ga`);
    } catch (error) {
      console.error(`❌ Admin ${adminId} ga xabar yuborib bo'lmadi:`, error);
    }
  }
}

export { bot };
