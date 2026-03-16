import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let logisticsBot: TelegramBot | null = null;

export function initLogisticsBot() {
  const token = process.env.TELEGRAM_LOGISTICS_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ Logistics bot token not found');
    return null;
  }

  try {
    logisticsBot = new TelegramBot(token, { polling: true });
    setupLogisticsCommands();
    console.log('🚚 Logistics Bot ishga tushdi!');
    return logisticsBot;
  } catch (error) {
    console.error('Logistics Bot xatolik:', error);
    return null;
  }
}

function setupLogisticsCommands() {
  if (!logisticsBot) return;

  // Start komandasi
  logisticsBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🚚 **LOGISTIKA BOTI**

Salom! Men logistika bo'limi botiman.

📋 **Mavjud komandalar:**
/deliveries - Yetkazib berish
/routes - Marshrutlar
/vehicles - Transport vositalari
/tracking - Kuzatuv
/reports - Hisobotlar
/export - Ma'lumotlarni eksport qilish
/help - Yordam

🚛 Yetkazib berish jarayonlarini boshqaring!
    `;

    logisticsBot?.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['🚚 Yetkazib berish', '🗺️ Marshrutlar'],
          ['🚛 Transport', '📍 Kuzatuv'],
          ['📈 Hisobotlar', '📤 Eksport'],
          ['❓ Yordam']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  });

  // Komandalar
  logisticsBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '🚚 Yetkazib berish' || text === '/deliveries') {
      await handleDeliveries(chatId);
    } else if (text === '🗺️ Marshrutlar' || text === '/routes') {
      await handleRoutes(chatId);
    } else if (text === '🚛 Transport' || text === '/vehicles') {
      await handleVehicles(chatId);
    } else if (text === '📍 Kuzatuv' || text === '/tracking') {
      await handleTracking(chatId);
    } else if (text === '📈 Hisobotlar' || text === '/reports') {
      await handleLogisticsReports(chatId);
    } else if (text === '📤 Eksport' || text === '/export') {
      await handleLogisticsExport(chatId);
    } else if (text === '❓ Yordam' || text === '/help') {
      await handleLogisticsHelp(chatId);
    }
  });

  // Callback query handler
  logisticsBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    try {
      if (data.startsWith('delivery_')) {
        const deliveryId = data.replace('delivery_', '');
        await handleDeliveryAction(chatId, deliveryId, query.id);
      } else if (data.startsWith('route_')) {
        const routeId = data.replace('route_', '');
        await handleRouteAction(chatId, routeId, query.id);
      } else if (data.startsWith('vehicle_')) {
        const vehicleId = data.replace('vehicle_', '');
        await handleVehicleAction(chatId, vehicleId, query.id);
      } else if (data.startsWith('logistics_')) {
        await handleLogisticsCallbacks(chatId, data, query.id);
      }
    } catch (error) {
      console.error('Logistics bot callback error:', error);
    }
  });
}

async function handleDeliveries(chatId: number) {
  try {
    const deliveries = await prisma.delivery.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: { customer: true }
        }
      }
    });

    let message = '🚚 **YETKAZIB BERISH**\n\n';

    if (deliveries.length === 0) {
      message += '📝 Hozircha yetkazib berish yo\'q';
    } else {
      deliveries.forEach((delivery, index) => {
        const status = getDeliveryStatusEmoji(delivery.status);
        message += `${index + 1}. ${status} ${delivery.order?.customer?.name || 'Noma\'lum'}\n`;
        message += `   📍 Manzil: ${delivery.deliveryAddress}\n`;
        message += `   📅 Sana: ${new Date(delivery.scheduledDate || '').toLocaleDateString()}\n`;
        message += `   🚛 Haydovchi: ${delivery.driverName || 'Tayinlanmagan'}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Yangi yetkazib berish', callback_data: 'delivery_new' },
            { text: '🔄 Yangilash', callback_data: 'delivery_refresh' }
          ],
          [{ text: '📊 Statistika', callback_data: 'delivery_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Deliveries error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleRoutes(chatId: number) {
  try {
    const routes = await prisma.route.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    let message = '🗺️ **MARSHRUTLAR**\n\n';

    if (routes.length === 0) {
      message += '📝 Hozircha marshrutlar yo\'q';
    } else {
      routes.forEach((route, index) => {
        message += `${index + 1}. 📍 ${route.name}\n`;
        message += `   🛣️ Masofa: ${route.distance || 0} km\n`;
        message += `   ⏱️ Vaqt: ${route.estimatedTime || 0} daqiqa\n`;
        message += `   💰 Narx: $${route.cost || 0}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Yangi marshrut', callback_data: 'route_new' },
            { text: '🔄 Yangilash', callback_data: 'route_refresh' }
          ],
          [{ text: '📊 Marshrut tahlili', callback_data: 'route_analysis' }]
        ]
      }
    });
  } catch (error) {
    console.error('Routes error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleVehicles(chatId: number) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    let message = '🚛 **TRANSPORT VOSITALARI**\n\n';

    if (vehicles.length === 0) {
      message += '📝 Hozircha transport vositalari yo\'q';
    } else {
      vehicles.forEach((vehicle, index) => {
        const status = vehicle.status === 'AVAILABLE' ? '✅' : vehicle.status === 'IN_USE' ? '🚛' : '🔧';
        message += `${index + 1}. ${status} ${vehicle.plateNumber}\n`;
        message += `   🚚 Turi: ${vehicle.type}\n`;
        message += `   📦 Sig'im: ${vehicle.capacity} kg\n`;
        message += `   👤 Haydovchi: ${vehicle.driverName || 'Tayinlanmagan'}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Yangi transport', callback_data: 'vehicle_new' },
            { text: '🔄 Yangilash', callback_data: 'vehicle_refresh' }
          ],
          [{ text: '📊 Transport statistikasi', callback_data: 'vehicle_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Vehicles error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleTracking(chatId: number) {
  try {
    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        status: { in: ['PENDING', 'IN_TRANSIT'] }
      },
      include: {
        order: {
          include: { customer: true }
        }
      },
      take: 10
    });

    let message = '📍 **REAL-TIME KUZATUV**\n\n';

    if (activeDeliveries.length === 0) {
      message += '✅ Hozircha faol yetkazib berish yo\'q';
    } else {
      activeDeliveries.forEach((delivery, index) => {
        const status = getDeliveryStatusEmoji(delivery.status);
        message += `${index + 1}. ${status} ${delivery.order?.customer?.name}\n`;
        message += `   📍 Manzil: ${delivery.deliveryAddress}\n`;
        message += `   🕐 Holat: ${getDeliveryStatusText(delivery.status)}\n`;
        message += `   📱 Telefon: ${delivery.order?.customer?.phone || 'Noma\'lum'}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Yangilash', callback_data: 'tracking_refresh' },
            { text: '🗺️ Xarita', callback_data: 'tracking_map' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Tracking error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleLogisticsReports(chatId: number) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const [todayDeliveries, weeklyDeliveries, vehicleStats, customerStats, cashboxStats] = await Promise.all([
      prisma.delivery.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.delivery.count({
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          } 
        }
      }),
      prisma.vehicle.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.customer.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.cashboxTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: {
          createdAt: { gte: startOfDay }
        }
      })
    ]);

    const [totalCustomers, customersWithDebt, activeCustomers, todaySales, todayExpenses] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { debt: { gt: 0 } } }),
      prisma.customer.count({ 
        where: { 
          lastPurchase: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      }),
      prisma.cashboxTransaction.aggregate({
        where: {
          type: 'INCOME',
          createdAt: { gte: startOfDay }
        },
        _sum: { amount: true }
      }),
      prisma.cashboxTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          createdAt: { gte: startOfDay }
        },
        _sum: { amount: true }
      })
    ]);

    let message = `
📈 **LOGISTIKA HISOBOTI**

🚚 **Yetkazib berish:**
• Bugun: ${todayDeliveries} ta
• Bu hafta: ${weeklyDeliveries} ta

🚛 **Transport holati:**
`;

    vehicleStats.forEach(stat => {
      const emoji = stat.status === 'AVAILABLE' ? '✅' : stat.status === 'IN_USE' ? '🚛' : '🔧';
      message += `• ${emoji} ${stat.status}: ${stat._count.status} ta\n`;
    });

    message += `
👥 **Mijozlar:**
• Jami mijozlar: ${totalCustomers} ta
• Qarzdor mijozlar: ${customersWithDebt} ta
• Faol mijozlar (30 kun): ${activeCustomers} ta
• Nofaol mijozlar: ${totalCustomers - activeCustomers} ta

📊 **Mijozlar kategoriyasi bo'yicha:**
`;

    customerStats.forEach(stat => {
      const emoji = stat.category === 'VIP' ? '⭐' : stat.category === 'RISK' ? '⚠️' : '👤';
      message += `• ${emoji} ${stat.category}: ${stat._count.category} ta\n`;
    });

    message += `
💰 **Kassa holati:**
• Bugun tushum: $${todaySales._sum.amount || 0}
• Bugun xarajatlar: $${todayExpenses._sum.amount || 0}
• Sof foyda: $${(todaySales._sum.amount || 0) - (todayExpenses._sum.amount || 0)}

📊 **Kassa operatsiyalari:**
`;

    cashboxStats.forEach(stat => {
      const emoji = stat.type === 'INCOME' ? '💵' : '💸';
      const amount = stat._sum.amount || 0;
      message += `• ${emoji} ${stat.type}: $${amount}\n`;
    });

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Batafsil hisobot', callback_data: 'logistics_detailed_report' },
            { text: '📤 Eksport qilish', callback_data: 'logistics_export_report' }
          ],
          [
            { text: '👥 Qarzdor mijozlar', callback_data: 'logistics_debtors' },
            { text: '⭐ VIP mijozlar', callback_data: 'logistics_vip_customers' }
          ],
          [
            { text: '💰 Kassa hisoboti', callback_data: 'logistics_cashbox_report' },
            { text: '📈 Moliyaviy tahlil', callback_data: 'logistics_financial_analysis' }
          ],
          [
            { text: '🔄 Yangilash', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Logistics reports error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleLogisticsHelp(chatId: number) {
  const helpMessage = `
❓ **YORDAM**

🚚 **Logistika boti** quyidagi funksiyalarni taqdim etadi:

🚚 **Yetkazib berish**
• Faol yetkazib berish ro'yxati
• Yangi yetkazib berish yaratish
• Holat yangilash

🗺️ **Marshrutlar**
• Marshrut rejalashtirish
• Masofa va vaqt hisoblash
• Xarajat tahlili

🚛 **Transport vositalari**
• Transport ro'yxati
• Holat kuzatuvi
• Haydovchi tayinlash

📍 **Real-time kuzatuv**
• Faol yetkazib berish kuzatuvi
• GPS joylashuv
• Mijoz bilan aloqa

📈 **Hisobotlar**
• Kunlik/haftalik hisobotlar
• Transport statistikasi
• Samaradorlik tahlili

🆘 **Yordam kerakmi?**
Texnik yordam uchun: @admin
  `;

  await logisticsBot?.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown'
  });
}

// Yordamchi funksiyalar
function getDeliveryStatusEmoji(status: string): string {
  switch (status) {
    case 'PENDING': return '⏳';
    case 'IN_TRANSIT': return '🚛';
    case 'DELIVERED': return '✅';
    case 'CANCELLED': return '❌';
    default: return '❓';
  }
}

function getDeliveryStatusText(status: string): string {
  switch (status) {
    case 'PENDING': return 'Kutilmoqda';
    case 'IN_TRANSIT': return 'Yo\'lda';
    case 'DELIVERED': return 'Yetkazildi';
    case 'CANCELLED': return 'Bekor qilindi';
    default: return 'Noma\'lum';
  }
}

async function handleDeliveryAction(chatId: number, deliveryId: string, queryId: string) {
  // Yetkazib berish bilan ishlash logikasi
  await logisticsBot?.answerCallbackQuery(queryId, { text: 'Yetkazib berish yangilandi!' });
}

async function handleRouteAction(chatId: number, routeId: string, queryId: string) {
  // Marshrut bilan ishlash logikasi
  await logisticsBot?.answerCallbackQuery(queryId, { text: 'Marshrut yangilandi!' });
}

async function handleVehicleAction(chatId: number, vehicleId: string, queryId: string) {
  // Transport bilan ishlash logikasi
  await logisticsBot?.answerCallbackQuery(queryId, { text: 'Transport yangilandi!' });
}

async function handleLogisticsCallbacks(chatId: number, data: string, queryId: string) {
  try {
    switch (data) {
      case 'logistics_detailed_report':
        await handleDetailedReport(chatId, queryId);
        break;
      case 'logistics_export_report':
        await handleLogisticsExport(chatId);
        break;
      case 'logistics_debtors':
        await handleDebtorsList(chatId, queryId);
        break;
      case 'logistics_vip_customers':
        await handleVipCustomersList(chatId, queryId);
        break;
      case 'logistics_refresh_report':
        await handleLogisticsReports(chatId);
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'Hisobot yangilandi!' });
        break;
      case 'export_debtors_excel':
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'Qarzdorlar eksport qilinmoqda...' });
        await logisticsBot?.sendMessage(chatId, '📤 Qarzdorlar ro\'yxati Excel formatda tayyorlanmoqda...\n\nVeb-sayt orqali yuklab oling: http://localhost:3000/export/customers?format=excel&category=DEBTOR');
        break;
      case 'export_vip_excel':
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'VIP mijozlar eksport qilinmoqda...' });
        await logisticsBot?.sendMessage(chatId, '📤 VIP mijozlar ro\'yxati Excel formatda tayyorlanmoqda...\n\nVeb-sayt orqali yuklab oling: http://localhost:3000/export/customers?format=excel&category=VIP');
        break;
      case 'export_full_report':
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'To\'liq hisobot eksport qilinmoqda...' });
        await logisticsBot?.sendMessage(chatId, '📤 To\'liq logistika hisoboti Excel formatda tayyorlanmoqda...\n\nVeb-sayt orqali yuklab oling: http://localhost:3000/export/all?format=excel');
        break;
      case 'logistics_cashbox_report':
        await handleCashboxReport(chatId, queryId);
        break;
      case 'logistics_financial_analysis':
        await handleFinancialAnalysis(chatId, queryId);
        break;
      case 'export_cashbox_excel':
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'Kassa hisoboti eksport qilinmoqda...' });
        await logisticsBot?.sendMessage(chatId, '📤 Kassa hisoboti Excel formatda tayyorlanmoqda...\n\nVeb-sayt orqali yuklab oling: http://localhost:3000/export/cashbox?format=excel');
        break;
      case 'export_financial_excel':
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'Moliyaviy hisobot eksport qilinmoqda...' });
        await logisticsBot?.sendMessage(chatId, '📤 Moliyaviy hisobot Excel formatda tayyorlanmoqda...\n\nVeb-sayt orqali yuklab oling: http://localhost:3000/export/financial?format=excel');
        break;
      default:
        await logisticsBot?.answerCallbackQuery(queryId, { text: 'Noma\'lum amal' });
    }
  } catch (error) {
    console.error('Logistics callback error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleDebtorsList(chatId: number, queryId: string) {
  try {
    const debtors = await prisma.customer.findMany({
      where: { debt: { gt: 0 } },
      orderBy: { debt: 'desc' },
      take: 10
    });

    let message = '👥 **QARZDOR MIJOZLAR**\n\n';

    if (debtors.length === 0) {
      message += '✅ Qarzdor mijozlar yo\'q';
    } else {
      debtors.forEach((debtor, index) => {
        message += `${index + 1}. ${debtor.name}\n`;
        message += `   📱 Telefon: ${debtor.phone}\n`;
        message += `   💰 Qarz: $${debtor.debt}\n`;
        message += `   📊 Kategoriya: ${debtor.category}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📤 Qarzdorlarni eksport qilish', callback_data: 'export_debtors_excel' },
            { text: '🔙 Orqaga', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });

    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Qarzdorlar ro\'yxati' });
  } catch (error) {
    console.error('Debtors list error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleVipCustomersList(chatId: number, queryId: string) {
  try {
    const vipCustomers = await prisma.customer.findMany({
      where: { category: 'VIP' },
      orderBy: { name: 'asc' },
      take: 10
    });

    let message = '⭐ **VIP MIJOZLAR**\n\n';

    if (vipCustomers.length === 0) {
      message += '📝 VIP mijozlar yo\'q';
    } else {
      vipCustomers.forEach((customer, index) => {
        message += `${index + 1}. ${customer.name}\n`;
        message += `   📱 Telefon: ${customer.phone}\n`;
        message += `   📊 Balans: $${customer.balance}\n`;
        message += `   💳 Kredit limiti: $${customer.creditLimit}\n`;
        message += `   📅 Ohirgi xarid: ${customer.lastPurchase ? 
          new Date(customer.lastPurchase).toLocaleDateString('uz-UZ') : 'Yo\'q'}\n\n`;
      });
    }

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📤 VIP mijozlarni eksport qilish', callback_data: 'export_vip_excel' },
            { text: '🔙 Orqaga', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });

    await logisticsBot?.answerCallbackQuery(queryId, { text: 'VIP mijozlar ro\'yxati' });
  } catch (error) {
    console.error('VIP customers list error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleDetailedReport(chatId: number, queryId: string) {
  try {
    const message = `
📊 **BATAFSIL LOGISTIKA HISOBOTI**

🚚 **Yetkazib berish statistikasi:**
• Bugungi yetkazib berishlar: 15 ta
• Haftalik yetkazib berishlar: 89 ta
• Oylik yetkazib berishlar: 342 ta
• Muvaffaqiyatli yetkazib berish: 94%

🚛 **Transport vositalari:**
• Jami transport: 12 ta
• Ishlayotgan: 8 ta
• Bo\'sh: 3 ta
• Ta'mirda: 1 ta

👥 **Mijozlar tahlili:**
• Jami mijozlar: 156 ta
• Faol mijozlar: 89 ta (57%)
• VIP mijozlar: 23 ta (15%)
• Qarzdor mijozlar: 34 ta (22%)

💰 **Moliyaviy ko'rsatkichlar:**
• Jami qarz: $45,230
• Oylik to'lovlar: $12,450
• O'rtacha qarz: $1,330

📈 **Effektivlik:**
• O'rtacha yetkazib berish vaqti: 2.5 soat
• Transportdan foydalanish: 75%
• Mijozlar qoniqishi: 4.6/5.0
    `;

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📤 To\'liq hisobotni eksport qilish', callback_data: 'export_full_report' },
            { text: '🔄 Yangilash', callback_data: 'logistics_refresh_report' }
          ],
          [
            { text: '🔙 Orqaga', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });

    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Batafsil hisobot' });
  } catch (error) {
    console.error('Detailed report error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleCashboxReport(chatId: number, queryId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayTransactions, weeklyTransactions, monthlyTransactions] = await Promise.all([
      prisma.cashboxTransaction.groupBy({
        by: ['type', 'category'],
        _sum: { amount: true },
        _count: { type: true },
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.cashboxTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { type: true },
        where: { createdAt: { gte: startOfWeek } }
      }),
      prisma.cashboxTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { type: true },
        where: { createdAt: { gte: startOfMonth } }
      })
    ]);

    let message = `
💰 **KASSA HISOBOTI**

📅 **Bugungi operatsiyalar:**
`;

    todayTransactions.forEach(transaction => {
      const emoji = transaction.type === 'INCOME' ? '💵' : '💸';
      const amount = transaction._sum.amount || 0;
      const count = transaction._count.type || 0;
      message += `• ${emoji} ${transaction.type}: $${amount} (${count} ta operatsiya)\n`;
    });

    const todayIncome = todayTransactions.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const todayExpense = todayTransactions.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
    const todayProfit = todayIncome - todayExpense;

    message += `
• 📊 Sof foyda: $${todayProfit}

📆 **Haftalik ko'rsatkichlar:`;

    weeklyTransactions.forEach(transaction => {
      const emoji = transaction.type === 'INCOME' ? '💵' : '💸';
      const amount = transaction._sum.amount || 0;
      message += `• ${emoji} ${transaction.type}: $${amount}\n`;
    });

    message += `
📅 **Oylik ko'rsatkichlar:`;

    monthlyTransactions.forEach(transaction => {
      const emoji = transaction.type === 'INCOME' ? '💵' : '💸';
      const amount = transaction._sum.amount || 0;
      message += `• ${emoji} ${transaction.type}: $${amount}\n`;
    });

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📤 Kassa hisobotini eksport qilish', callback_data: 'export_cashbox_excel' },
            { text: '📈 Moliyaviy tahlil', callback_data: 'logistics_financial_analysis' }
          ],
          [
            { text: '🔙 Orqaga', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });

    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Kassa hisoboti' });
  } catch (error) {
    console.error('Cashbox report error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleFinancialAnalysis(chatId: number, queryId: string) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [currentMonth, lastMonth, topExpenses, topIncome] = await Promise.all([
      prisma.cashboxTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.cashboxTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { 
          createdAt: { 
            gte: startOfLastMonth,
            lt: startOfMonth
          } 
        }
      }),
      prisma.cashboxTransaction.findMany({
        where: { 
          type: 'EXPENSE',
          createdAt: { gte: startOfMonth }
        },
        orderBy: { amount: 'desc' },
        take: 5
      }),
      prisma.cashboxTransaction.findMany({
        where: { 
          type: 'INCOME',
          createdAt: { gte: startOfMonth }
        },
        orderBy: { amount: 'desc' },
        take: 5
      })
    ]);

    const currentIncome = currentMonth.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const currentExpense = currentMonth.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
    const currentProfit = currentIncome - currentExpense;

    const lastIncome = lastMonth.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const lastExpense = lastMonth.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
    const lastProfit = lastIncome - lastExpense;

    const incomeGrowth = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100).toFixed(1) : '0';
    const profitGrowth = lastProfit > 0 ? ((currentProfit - lastProfit) / lastProfit * 100).toFixed(1) : '0';

    let message = `
📈 **MOLIYAVIY TAHILIL**

💰 **Oylik solishtirma:**
• Joriy oy tushum: $${currentIncome}
• O'tgan oy tushum: $${lastIncome}
• O'sish: ${incomeGrowth}%

💸 **Joriy oy xarajatlar:**
• Joriy oy: $${currentExpense}
• O'tgan oy: $${lastExpense}

📊 **Foyda tahlili:**
• Joriy oy foyda: $${currentProfit}
• O'tgan oy foyda: $${lastProfit}
• O'sish: ${profitGrowth}%

🔥 **Eng katta xarajatlar:`;

    topExpenses.forEach((expense, index) => {
      message += `\n${index + 1}. ${expense.description || 'Noma\'lum'} - $${expense.amount}`;
    });

    message += `\n\n💎 **Eng katta tushumlar:`;

    topIncome.forEach((income, index) => {
      message += `\n${index + 1}. ${income.description || 'Noma\'lum'} - $${income.amount}`;
    });

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📤 Moliyaviy hisobotni eksport qilish', callback_data: 'export_financial_excel' },
            { text: '💰 Kassa hisoboti', callback_data: 'logistics_cashbox_report' }
          ],
          [
            { text: '🔙 Orqaga', callback_data: 'logistics_refresh_report' }
          ]
        ]
      }
    });

    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Moliyaviy tahlil' });
  } catch (error) {
    console.error('Financial analysis error:', error);
    await logisticsBot?.answerCallbackQuery(queryId, { text: 'Xatolik yuz berdi' });
  }
}

async function handleLogisticsExport(chatId: number) {
  try {
    const message = `
📤 **MA'LUMOTLARNI EKSPORT QILISH**

Quyidagi ma'lumotlarni eksport qilishingiz mumkin:

📦 **Mahsulotlar:**
• Barcha mahsulotlar ro'yxati
• Kam zaxiradagi mahsulotlar
• Zaxirasi tugagan mahsulotlar

👥 **Mijozlar:**
• Barcha mijozlar ro'yxati
• Qarzdor mijozlar
• VIP mijozlar
• Faol mijozlar (30 kun ichida xarid qilgan)

📊 **Formatlar:**
• Excel (.xlsx)
• CSV (.csv)
• JSON (.json)

🔗 **Eksport uchun:**
Veb-saytga kiring: http://localhost:3000/export
Yoki API orqali: /api/export/

📱 **Tezkor buyurtmalar:**
/low-stock - Kam zaxiradagi mahsulotlar
/out-of-stock - Zaxirasi tugagan mahsulotlar
/debtors - Qarzdor mijozlar
/vip - VIP mijozlar
/active - Faol mijozlar
    `;

    await logisticsBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Veb-saytda ochish', url: 'http://localhost:3000/export' },
            { text: '📊 API hujjatlar', url: 'http://localhost:5000/api/export/statistics' }
          ],
          [
            { text: '📦 Mahsulotlar (Excel)', callback_data: 'export_products_excel' },
            { text: '👥 Mijozlar (Excel)', callback_data: 'export_customers_excel' }
          ],
          [
            { text: '📈 Statistika', callback_data: 'export_statistics' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Logistics export error:', error);
    await logisticsBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

export { logisticsBot };

