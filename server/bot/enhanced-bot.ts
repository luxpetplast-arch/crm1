import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
import { analyzeOrderAndCreatePlan } from '../utils/ai-order-planner';

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let bot: TelegramBot | null = null;

// Mijoz sessiyalari
const userSessions = new Map<number, { phone?: string; step?: string }>();

// Buyurtma sessiyalari
const orderSessions = new Map<number, {
  step: string;
  customerId?: string;
  items: Array<{ productId: string; productName: string; quantityBags: number; quantityUnits: number; price: number }>;
  requestedDate?: Date;
  notes?: string;
}>();

export function initEnhancedTelegramBot() {
  if (!BOT_TOKEN) {
    console.warn('⚠️  Telegram bot token not configured');
    return null;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('✅ Enhanced Telegram bot started successfully!');

    setupEnhancedBotCommands();
    
    // Kunlik eslatmalarni boshlash
    startDailyReminders();
    
    return bot;
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
    return null;
  }
}

function setupEnhancedBotCommands() {
  if (!bot) return;

  // /start - Botni boshlash va ID olish
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username || '';
    const firstName = msg.from?.first_name || '';
    const lastName = msg.from?.last_name || '';
    
    // Mijoz allaqachon bog'langanmi?
    const existingCustomer = await prisma.customer.findUnique({
      where: { telegramChatId: chatId.toString() }
    });

    if (existingCustomer) {
      const welcomeBack = `
🎉 <b>Qaytganingizdan xursandmiz, ${existingCustomer.name}!</b>

🆔 Sizning ID: <code>${existingCustomer.id.slice(0, 8)}</code>
📱 Telegram: @${username || 'username'}

💰 <b>Hozirgi Holat:</b>
Balans: ${existingCustomer.balance.toFixed(2)} USD
Qarz: ${existingCustomer.debt.toFixed(2)} USD

<b>Buyruqlar:</b>
/balance - Balans va qarz
/orders - Buyurtmalar tarixi
/settings - Sozlamalar
/help - Yordam
      `.trim();

      bot!.sendMessage(chatId, welcomeBack, { parse_mode: 'HTML' });
      return;
    }

    // Yangi foydalanuvchi
    const welcomeMessage = `
🎉 <b>AzizTrades ERP Botiga Xush Kelibsiz!</b>

👋 Salom ${firstName} ${lastName}!

Bu bot orqali siz:
✅ Real-time sotuv cheklari olasiz
✅ Balans va qarzni kuzatasiz
✅ Buyurtma tarixini ko'rasiz
✅ Eslatmalar olasiz

<b>Boshlash uchun:</b>
1️⃣ /register - Telefon raqamingizni ulang
2️⃣ Admindan tasdiqlang
3️⃣ Barcha xizmatlardan foydalaning!

<b>Buyruqlar:</b>
/register - Ro'yxatdan o'tish
/help - Yordam
    `.trim();

    bot!.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
  });

  // /register - Ro'yxatdan o'tish
  bot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username || '';
    
    // Allaqachon bog'langanmi?
    const existingCustomer = await prisma.customer.findUnique({
      where: { telegramChatId: chatId.toString() }
    });

    if (existingCustomer) {
      bot!.sendMessage(chatId, '✅ Siz allaqachon ro\'yxatdan o\'tgansiz!', { parse_mode: 'HTML' });
      return;
    }

    userSessions.set(chatId, { step: 'awaiting_phone' });
    bot!.sendMessage(
      chatId,
      `📱 <b>Telefon Raqamingizni Yuboring</b>\n\nTizimda ro'yxatdan o'tgan telefon raqamingizni kiriting:\n\nMasalan: +998901234567\n\n<i>Agar tizimda yo'q bo'lsangiz, avval admin bilan bog'laning.</i>`,
      { parse_mode: 'HTML' }
    );
  });

  // /balance - Balans va qarz
  bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    const customer = await findCustomerByChatId(chatId);

    if (!customer) {
      bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz. /register buyrug\'ini ishlating.');
      return;
    }

    // Oxirgi 5 ta to'lanmagan sotuvlar
    const unpaidSales = await prisma.sale.findMany({
      where: {
        customerId: customer.id,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] }
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    let unpaidList = '';
    if (unpaidSales.length > 0) {
      unpaidList = '\n\n⚠️ <b>To\'lanmagan Sotuvlar:</b>\n';
      unpaidSales.forEach((sale, i) => {
        const debt = sale.totalAmount - sale.paidAmount;
        unpaidList += `${i + 1}. ${sale.product?.name}: ${debt.toFixed(2)} USD\n`;
      });
    }

    const message = `
💰 <b>Sizning Balansingiz</b>

🆔 ID: <code>${customer.id.slice(0, 8)}</code>
👤 Mijoz: ${customer.name}
📞 Telefon: ${customer.phone}
📊 Kategoriya: ${customer.category}

💵 <b>Moliyaviy Holat:</b>
Balans: <b>${customer.balance.toFixed(2)} USD</b>
Qarz: <b>${customer.debt.toFixed(2)} USD</b>
Kredit Limit: ${customer.creditLimit.toFixed(2)} USD

📈 <b>Statistika:</b>
Jami sotuvlar: ${customer._count.sales}
Oxirgi xarid: ${customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('uz-UZ') : 'Yo\'q'}
Oxirgi to\'lov: ${customer.lastPayment ? new Date(customer.lastPayment).toLocaleDateString('uz-UZ') : 'Yo\'q'}
${unpaidList}
    `.trim();

    bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  });

  // /orders - Buyurtmalar tarixi
  bot.onText(/\/orders/, async (msg) => {
    const chatId = msg.chat.id;
    const customer = await findCustomerByChatId(chatId);

    if (!customer) {
      bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz. /register buyrug\'ini ishlating.');
      return;
    }

    const sales = await prisma.sale.findMany({
      where: { customerId: customer.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    if (sales.length === 0) {
      bot!.sendMessage(chatId, '📦 Sizda hali buyurtmalar yo\'q.');
      return;
    }

    let message = `📋 <b>Oxirgi 15 ta Buyurtma</b>\n\n`;
    
    sales.forEach((sale, index) => {
      const date = new Date(sale.createdAt).toLocaleDateString('uz-UZ');
      const time = new Date(sale.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const status = sale.paymentStatus === 'PAID' ? '✅' : sale.paymentStatus === 'PARTIAL' ? '⚠️' : '❌';
      const debt = sale.totalAmount - sale.paidAmount;
      
      message += `${index + 1}. ${status} <b>${sale.product?.name || 'Mahsulot'}</b>\n`;
      message += `   📅 ${date} ${time}\n`;
      message += `   📦 ${sale.quantity} qop × $${sale.pricePerBag}\n`;
      message += `   💰 Jami: $${sale.totalAmount.toFixed(2)}\n`;
      message += `   💵 To'langan: $${sale.paidAmount.toFixed(2)}\n`;
      if (debt > 0) {
        message += `   ⚠️ Qarz: $${debt.toFixed(2)}\n`;
      }
      message += '\n';
    });

    bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  });

  // /settings - Sozlamalar
  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    const customer = await findCustomerByChatId(chatId);

    if (!customer) {
      bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz. /register buyrug\'ini ishlating.');
      return;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: customer.notificationsEnabled ? '🔔 Eslatmalar: Yoniq' : '🔕 Eslatmalar: O\'chiq', callback_data: 'toggle_notifications' }
        ],
        [
          { text: `⏰ Eslatma: ${customer.debtReminderDays} kun`, callback_data: 'change_reminder_days' }
        ],
        [
          { text: '❌ Yopish', callback_data: 'close' }
        ]
      ]
    };

    const message = `
⚙️ <b>Sozlamalar</b>

🆔 ID: <code>${customer.id.slice(0, 8)}</code>
👤 ${customer.name}

<b>Hozirgi Sozlamalar:</b>
🔔 Eslatmalar: ${customer.notificationsEnabled ? 'Yoniq ✅' : 'O\'chiq ❌'}
⏰ Qarz eslatmasi: Har ${customer.debtReminderDays} kunda

<i>Tugmalarni bosib sozlang:</i>
    `.trim();

    bot!.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // Callback query handler
  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;
    
    // Buyurtma callback'lari
    if (data?.startsWith('order_')) {
      await handleOrderCallbacks(query);
      return;
    }
    
    const customer = await findCustomerByChatId(chatId);

    if (!customer) {
      bot!.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi' });
      return;
    }

    if (data === 'toggle_notifications') {
      // Eslatmalarni yoqish/o'chirish
      await prisma.customer.update({
        where: { id: customer.id },
        data: { notificationsEnabled: !customer.notificationsEnabled }
      });

      bot!.answerCallbackQuery(query.id, { 
        text: customer.notificationsEnabled ? 'Eslatmalar o\'chirildi' : 'Eslatmalar yoqildi'
      });

      // Xabarni yangilash
      bot!.editMessageText(
        `✅ Eslatmalar ${customer.notificationsEnabled ? 'o\'chirildi' : 'yoqildi'}!\n\nYangi sozlamalarni ko'rish uchun /settings`,
        {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: 'HTML'
        }
      );
    } else if (data === 'change_reminder_days') {
      // Eslatma kunlarini o'zgartirish
      const keyboard = {
        inline_keyboard: [
          [
            { text: '3 kun', callback_data: 'set_days_3' },
            { text: '7 kun', callback_data: 'set_days_7' },
            { text: '14 kun', callback_data: 'set_days_14' }
          ],
          [
            { text: '30 kun', callback_data: 'set_days_30' },
            { text: '❌ Bekor', callback_data: 'close' }
          ]
        ]
      };

      bot!.editMessageText(
        '⏰ <b>Qarz Eslatma Muddatini Tanlang:</b>\n\nQancha kundan keyin eslatma yuborilsin?',
        {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: 'HTML',
          reply_markup: keyboard
        }
      );
    } else if (data?.startsWith('set_days_')) {
      const days = parseInt(data.split('_')[2]);
      await prisma.customer.update({
        where: { id: customer.id },
        data: { debtReminderDays: days }
      });

      bot!.answerCallbackQuery(query.id, { text: `Eslatma ${days} kunga o'rnatildi` });
      bot!.editMessageText(
        `✅ Eslatma muddati ${days} kunga o'rnatildi!\n\nYangi sozlamalarni ko'rish uchun /settings`,
        {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: 'HTML'
        }
      );
    } else if (data === 'close') {
      bot!.deleteMessage(chatId, query.message!.message_id);
    }
  });

  // /order - Yangi buyurtma berish
  bot.onText(/\/order/, async (msg) => {
    const chatId = msg.chat.id;
    
    const customer = await findCustomerByChatId(chatId);
    if (!customer) {
      bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz. /register buyrug\'ini ishlating.');
      return;
    }

    // Sessiyani boshlash
    orderSessions.set(chatId, {
      step: 'SELECT_PRODUCT',
      customerId: customer.id,
      items: []
    });

    // Mahsulotlar ro'yxatini ko'rsatish
    const products = await prisma.product.findMany({
      where: { currentStock: { gt: 0 } },
      orderBy: { name: 'asc' }
    });

    if (products.length === 0) {
      bot!.sendMessage(chatId, '❌ Hozirda mahsulotlar mavjud emas.');
      orderSessions.delete(chatId);
      return;
    }

    let message = '📦 <b>Yangi Buyurtma</b>\n\n';
    message += '📋 <b>Mavjud Mahsulotlar:</b>\n\n';

    const keyboard = {
      inline_keyboard: products.map((product, index) => [
        {
          text: `${index + 1}. ${product.name} - $${product.pricePerBag}/qop (Zaxira: ${product.currentStock})`,
          callback_data: `order_product_${product.id}`
        }
      ])
    };

    keyboard.inline_keyboard.push([
      { text: '❌ Bekor qilish', callback_data: 'order_cancel' }
    ]);

    bot!.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // /myorders - Mening buyurtmalarim
  bot.onText(/\/myorders/, async (msg) => {
    const chatId = msg.chat.id;
    
    const customer = await findCustomerByChatId(chatId);
    if (!customer) {
      bot!.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagansiz.');
      return;
    }

    const orders = await (prisma as any).order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (orders.length === 0) {
      bot!.sendMessage(chatId, '📦 Sizda hali buyurtmalar yo\'q.\n\nYangi buyurtma berish uchun: /order');
      return;
    }

    let message = '📦 <b>Mening Buyurtmalarim</b>\n\n';

    orders.forEach((order: any, index: number) => {
      const statusEmojiMap: Record<string, string> = {
        PENDING: '⏳',
        CONFIRMED: '✅',
        IN_PRODUCTION: '🏭',
        READY: '✅',
        DELIVERED: '🚚',
        CANCELLED: '❌'
      };
      const statusEmoji = statusEmojiMap[order.status] || '❓';

      const statusTextMap: Record<string, string> = {
        PENDING: 'Kutilmoqda',
        CONFIRMED: 'Tasdiqlandi',
        IN_PRODUCTION: 'Ishlab chiqarilmoqda',
        READY: 'Tayyor',
        DELIVERED: 'Yetkazildi',
        CANCELLED: 'Bekor qilindi'
      };
      const statusText = statusTextMap[order.status] || order.status;

      message += `${index + 1}. ${statusEmoji} <b>#${order.orderNumber}</b>\n`;
      message += `   📅 ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}\n`;
      message += `   📦 ${order.items.length} xil mahsulot\n`;
      message += `   💰 ${order.totalAmount.toFixed(2)} USD\n`;
      message += `   📊 ${statusText}\n`;
      
      if (order.promisedDate) {
        message += `   🎯 Tayyor bo\'ladi: ${new Date(order.promisedDate).toLocaleDateString('uz-UZ')}\n`;
      }
      
      message += '\n';
    });

    message += '\n<i>Yangi buyurtma berish: /order</i>';

    bot!.sendMessage(chatId, message, { parse_mode: 'HTML' });
  });

  // /help - Yordam
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📚 <b>Yordam - AzizTrades ERP Bot</b>

<b>🎯 Asosiy Buyruqlar:</b>

/start - Botni boshlash va ID olish
/register - Telefon raqamni ulash
/balance - Balans, qarz va statistika
/orders - Buyurtmalar tarixi (15 ta)
/order - Yangi buyurtma berish 🆕
/myorders - Mening buyurtmalarim 🆕
/settings - Eslatmalar sozlamalari
/help - Bu yordam xabari

<b>🔔 Avtomatik Xizmatlar:</b>

• ✅ Har bir sotuvdan keyin real-time chek
• 💰 Qarz eslatmalari (sozlanadi)
• 📊 Kunlik hisobotlar
• ⚠️ Muhim bildirishnomalar
• 🤖 AI buyurtma rejalashtirish

<b>⚙️ Sozlamalar:</b>

/settings orqali:
• Eslatmalarni yoqish/o'chirish
• Eslatma muddatini o'zgartirish (3-30 kun)

<b>📞 Qo'llab-quvvatlash:</b>

Savollar bo'lsa admin bilan bog'laning:
📧 admin@aziztrades.com
📱 +998901234567

<b>🆔 Sizning ID:</b>
Har bir mijozga noyob ID beriladi.
/start bosing va ID ni ko'ring.
    `.trim();

    bot!.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
  });

  // Oddiy xabarlarni qayta ishlash
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    // Ro'yxatdan o'tish sessiyasi
    const session = userSessions.get(chatId);
    if (session && session.step === 'awaiting_phone') {
      const phone = text.trim();
      
      // Telefon formatini tekshirish
      if (!phone.match(/^\+?998\d{9}$/)) {
        bot!.sendMessage(chatId, '❌ Noto\'g\'ri format. Iltimos, to\'g\'ri telefon raqam kiriting:\n\nMasalan: +998901234567');
        return;
      }

      // Telefon raqam tizimda bormi?
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone }
      });

      if (existingCustomer) {
        // Telegram ma'lumotlarini yangilash
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { 
            telegramChatId: chatId.toString(),
            telegramUsername: msg.from?.username || null
          }
        });

        userSessions.delete(chatId);
        
        const successMessage = `
✅ <b>Muvaffaqiyatli Bog'landingiz!</b>

🆔 Sizning ID: <code>${existingCustomer.id.slice(0, 8)}</code>
👤 Ism: ${existingCustomer.name}
📱 Telefon: ${existingCustomer.phone}

💰 <b>Hozirgi Holat:</b>
Balans: ${existingCustomer.balance.toFixed(2)} USD
Qarz: ${existingCustomer.debt.toFixed(2)} USD

🎉 Endi barcha xizmatlardan foydalanishingiz mumkin!

<b>Keyingi Qadamlar:</b>
/balance - Balansni ko'rish
/orders - Buyurtmalar tarixi
/order - Yangi buyurtma berish
/settings - Sozlamalar
        `.trim();

        bot!.sendMessage(chatId, successMessage, { parse_mode: 'HTML' });
      } else {
        bot!.sendMessage(
          chatId,
          '❌ <b>Telefon Raqam Topilmadi</b>\n\nBu telefon raqam tizimda yo\'q.\n\n<b>Iltimos:</b>\n1. To\'g\'ri telefon raqam kiritganingizni tekshiring\n2. Yoki avval admin orqali ro\'yxatdan o\'ting\n\n📞 Admin: +998901234567',
          { parse_mode: 'HTML' }
        );
        userSessions.delete(chatId);
      }
      return;
    }

    // Buyurtma sessiyasi - Miqdor kiritish
    const orderSession = orderSessions.get(chatId);
    if (orderSession && orderSession.step === 'ENTER_QUANTITY') {
      // Miqdorni parse qilish
      const bagMatch = text.match(/(\d+)\s*(qop|bag)/i);
      const unitMatch = text.match(/(\d+)\s*(dona|unit|pc)/i);

      if (!bagMatch && !unitMatch) {
        bot!.sendMessage(chatId, '❌ Noto\'g\'ri format. Masalan: <code>100 qop</code> yoki <code>5000 dona</code>', {
          parse_mode: 'HTML'
        });
        return;
      }

      const lastItem = orderSession.items[orderSession.items.length - 1];
      
      if (bagMatch) {
        lastItem.quantityBags = parseInt(bagMatch[1]);
      }
      if (unitMatch) {
        lastItem.quantityUnits = parseInt(unitMatch[1]);
      }

      // Davom ettirish
      const keyboard = {
        inline_keyboard: [
          [
            { text: '➕ Yana mahsulot qo\'shish', callback_data: 'order_add_more' }
          ],
          [
            { text: '✅ Buyurtmani yakunlash', callback_data: 'order_finish' }
          ]
        ]
      };

      bot!.sendMessage(chatId, '✅ Qo\'shildi! Davom ettirasizmi?', {
        reply_markup: keyboard
      });
      return;
    }
  });
}

// Buyurtma callback'larini qayta ishlash
async function handleOrderCallbacks(query: TelegramBot.CallbackQuery) {
  const chatId = query.message!.chat.id;
  const data = query.data || '';

  // Mahsulot tanlash
  if (data.startsWith('order_product_')) {
    const productId = data.replace('order_product_', '');
    const session = orderSessions.get(chatId);

    if (!session) {
      bot!.answerCallbackQuery(query.id, { text: 'Sessiya tugadi. /order dan qayta boshlang.' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      bot!.answerCallbackQuery(query.id, { text: 'Mahsulot topilmadi' });
      return;
    }

    // Miqdorni so'rash
    session.step = 'ENTER_QUANTITY';
    session.items.push({
      productId: product.id,
      productName: product.name,
      quantityBags: 0,
      quantityUnits: 0,
      price: product.pricePerBag
    });

    orderSessions.set(chatId, session);

    const message = `
📦 <b>${product.name}</b> tanlandi

💰 Narx: $${product.pricePerBag}/qop
📊 Zaxira: ${product.currentStock} qop
📏 Bir qopda: ${product.unitsPerBag} dona

<b>Miqdorni kiriting:</b>
Masalan: <code>100 qop</code> yoki <code>5000 dona</code>

Yoki quyidagi tugmalardan tanlang:
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: '10 qop', callback_data: `order_qty_${productId}_10_bags` },
          { text: '50 qop', callback_data: `order_qty_${productId}_50_bags` },
          { text: '100 qop', callback_data: `order_qty_${productId}_100_bags` }
        ],
        [
          { text: '1000 dona', callback_data: `order_qty_${productId}_1000_units` },
          { text: '5000 dona', callback_data: `order_qty_${productId}_5000_units` }
        ],
        [
          { text: '❌ Bekor qilish', callback_data: 'order_cancel' }
        ]
      ]
    };

    bot!.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message!.message_id,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });

    bot!.answerCallbackQuery(query.id);
  }

  // Miqdor tanlash
  else if (data.startsWith('order_qty_')) {
    const parts = data.split('_');
    const productId = parts[2];
    const quantity = parseInt(parts[3]);
    const type = parts[4]; // bags yoki units

    const session = orderSessions.get(chatId);
    if (!session) return;

    const item = session.items.find(i => i.productId === productId);
    if (!item) return;

    if (type === 'bags') {
      item.quantityBags = quantity;
      item.quantityUnits = 0;
    } else {
      item.quantityBags = 0;
      item.quantityUnits = quantity;
    }

    // Yana mahsulot qo'shish yoki yakunlash
    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ Yana mahsulot qo\'shish', callback_data: 'order_add_more' }
        ],
        [
          { text: '✅ Buyurtmani yakunlash', callback_data: 'order_finish' }
        ],
        [
          { text: '❌ Bekor qilish', callback_data: 'order_cancel' }
        ]
      ]
    };

    let message = '✅ <b>Mahsulot qo\'shildi!</b>\n\n';
    message += '<b>Joriy buyurtma:</b>\n';
    
    session.items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName}\n`;
      if (item.quantityBags > 0) {
        message += `   📦 ${item.quantityBags} qop × $${item.price}\n`;
      }
      if (item.quantityUnits > 0) {
        message += `   📏 ${item.quantityUnits} dona\n`;
      }
    });

    const total = session.items.reduce((sum, item) => {
      return sum + (item.quantityBags * item.price);
    }, 0);

    message += `\n💰 <b>Jami:</b> $${total.toFixed(2)}`;

    bot!.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message!.message_id,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });

    bot!.answerCallbackQuery(query.id, { text: 'Qo\'shildi!' });
  }

  // Yana mahsulot qo'shish
  else if (data === 'order_add_more') {
    const products = await prisma.product.findMany({
      where: { currentStock: { gt: 0 } },
      orderBy: { name: 'asc' }
    });

    const keyboard = {
      inline_keyboard: products.map((product, index) => [
        {
          text: `${index + 1}. ${product.name} - $${product.pricePerBag}/qop`,
          callback_data: `order_product_${product.id}`
        }
      ])
    };

    keyboard.inline_keyboard.push([
      { text: '✅ Buyurtmani yakunlash', callback_data: 'order_finish' }
    ]);

    bot!.editMessageReplyMarkup(keyboard, {
      chat_id: chatId,
      message_id: query.message!.message_id
    });

    bot!.answerCallbackQuery(query.id);
  }

  // Buyurtmani yakunlash
  else if (data === 'order_finish') {
    const session = orderSessions.get(chatId);
    if (!session || session.items.length === 0) {
      bot!.answerCallbackQuery(query.id, { text: 'Buyurtmada mahsulot yo\'q' });
      return;
    }

    // Qachon kerak?
    const keyboard = {
      inline_keyboard: [
        [
          { text: '⚡ Tezkor (24 soat)', callback_data: 'order_date_immediate' }
        ],
        [
          { text: '📅 Ertaga', callback_data: 'order_date_tomorrow' },
          { text: '📅 3 kun', callback_data: 'order_date_3days' }
        ],
        [
          { text: '📅 1 hafta', callback_data: 'order_date_week' },
          { text: '📅 2 hafta', callback_data: 'order_date_2weeks' }
        ],
        [
          { text: '❌ Bekor qilish', callback_data: 'order_cancel' }
        ]
      ]
    };

    bot!.editMessageText(
      '📅 <b>Qachon kerak?</b>\n\nYetkazib berish sanasini tanlang:',
      {
        chat_id: chatId,
        message_id: query.message!.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );

    bot!.answerCallbackQuery(query.id);
  }

  // Sana tanlash
  else if (data.startsWith('order_date_')) {
    const dateType = data.replace('order_date_', '');
    const session = orderSessions.get(chatId);
    if (!session) return;

    const now = new Date();
    let requestedDate = new Date();

    switch (dateType) {
      case 'immediate':
        requestedDate.setHours(now.getHours() + 24);
        break;
      case 'tomorrow':
        requestedDate.setDate(now.getDate() + 1);
        break;
      case '3days':
        requestedDate.setDate(now.getDate() + 3);
        break;
      case 'week':
        requestedDate.setDate(now.getDate() + 7);
        break;
      case '2weeks':
        requestedDate.setDate(now.getDate() + 14);
        break;
    }

    session.requestedDate = requestedDate;

    // Buyurtmani yaratish
    try {
      const totalAmount = session.items.reduce((sum, item) => {
        return sum + (item.quantityBags * item.price);
      }, 0);

      const order = await (prisma as any).order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          customerId: session.customerId!,
          status: 'PENDING',
          priority: dateType === 'immediate' ? 'URGENT' : 'NORMAL',
          requestedDate: session.requestedDate,
          totalAmount,
          notes: `Telegram bot orqali buyurtma`
        }
      });

      // Mahsulotlarni qo'shish
      for (const item of session.items) {
        await (prisma as any).orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantityBags: item.quantityBags,
            quantityUnits: item.quantityUnits,
            pricePerBag: item.price,
            subtotal: item.quantityBags * item.price
          }
        });
      }

      // AI rejani yaratish
      const aiResult = await analyzeOrderAndCreatePlan(order.id);

      // Mijozga xabar
      let message = '✅ <b>Buyurtma qabul qilindi!</b>\n\n';
      message += `🆔 Buyurtma: <b>#${order.orderNumber}</b>\n`;
      message += `📅 Sana: ${requestedDate.toLocaleDateString('uz-UZ')}\n`;
      message += `💰 Summa: $${totalAmount.toFixed(2)}\n\n`;
      
      message += '<b>Mahsulotlar:</b>\n';
      session.items.forEach((item, index) => {
        message += `${index + 1}. ${item.productName}\n`;
        if (item.quantityBags > 0) message += `   📦 ${item.quantityBags} qop\n`;
        if (item.quantityUnits > 0) message += `   📏 ${item.quantityUnits} dona\n`;
      });

      message += `\n🤖 <b>AI Tahlil:</b>\n`;
      message += `🎯 Ishonch: ${aiResult.aiConfidence.toFixed(0)}%\n`;
      
      if (aiResult.recommendations.length > 0) {
        message += `\n💡 <b>Tavsiyalar:</b>\n`;
        aiResult.recommendations.slice(0, 2).forEach(rec => {
          message += `• ${rec.description}\n`;
        });
      }

      message += `\n✅ Buyurtmangiz ko\'rib chiqilmoqda!\n`;
      message += `📞 Tez orada aloqaga chiqamiz.`;

      bot!.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message!.message_id,
        parse_mode: 'HTML'
      });

      // Sessiyani tozalash
      orderSessions.delete(chatId);

      bot!.answerCallbackQuery(query.id, { text: 'Buyurtma yuborildi!' });

    } catch (error) {
      console.error('Order creation error:', error);
      bot!.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi' });
    }
  }

  // Bekor qilish
  else if (data === 'order_cancel') {
    orderSessions.delete(chatId);
    bot!.editMessageText(
      '❌ Buyurtma bekor qilindi.\n\nYangi buyurtma berish: /order',
      {
        chat_id: chatId,
        message_id: query.message!.message_id
      }
    );
    bot!.answerCallbackQuery(query.id, { text: 'Bekor qilindi' });
  }
}

// Mijozni chat ID orqali topish
async function findCustomerByChatId(chatId: number) {
  const customer = await prisma.customer.findUnique({
    where: { telegramChatId: chatId.toString() },
    include: {
      _count: { select: { sales: true, payments: true } }
    }
  });

  return customer;
}

// Real-time chek yuborish
export async function sendEnhancedReceipt(sale: any, customer: any) {
  if (!bot || !customer.telegramChatId) return false;

  try {
    const chatId = parseInt(customer.telegramChatId);
    
    // To'lov tafsilotlarini parse qilish
    let paymentDetails = { uzs: 0, usd: 0, click: 0 };
    if (sale.paymentDetails) {
      try {
        paymentDetails = JSON.parse(sale.paymentDetails);
      } catch (e) {}
    }

    const debt = sale.totalAmount - sale.paidAmount;

    const message = `
🧾 <b>YANGI SOTUV CHEKI</b>

🆔 Chek ID: <code>${sale.id.slice(0, 8)}</code>
📅 Sana: ${new Date(sale.createdAt).toLocaleString('uz-UZ')}
👤 Mijoz: ${customer.name}

📦 <b>Mahsulot Ma'lumotlari:</b>
${sale.product?.name || 'Mahsulot'}
• Miqdor: ${sale.quantity} qop
• Narx: $${sale.pricePerBag} / qop
• Qop turi: ${sale.bagType}

💰 <b>To'lov Tafsilotlari:</b>
Jami: <b>$${sale.totalAmount.toFixed(2)}</b>

${paymentDetails.uzs > 0 ? `💵 So'm: ${paymentDetails.uzs.toLocaleString()} UZS\n` : ''}${paymentDetails.usd > 0 ? `💵 Dollar: $${paymentDetails.usd.toFixed(2)}\n` : ''}${paymentDetails.click > 0 ? `💳 Click: ${paymentDetails.click.toLocaleString()} UZS\n` : ''}
To'langan: <b>$${sale.paidAmount.toFixed(2)}</b>
${debt > 0 ? `\n⚠️ <b>Qolgan Qarz: $${debt.toFixed(2)}</b>` : ''}

${sale.paymentStatus === 'PAID' ? '✅ <b>To\'liq To\'langan</b>' : sale.paymentStatus === 'PARTIAL' ? '⚠️ <b>Qisman To\'langan</b>' : '❌ <b>To\'lanmagan</b>'}

💳 <b>Umumiy Balans:</b>
Jami qarz: $${customer.debt.toFixed(2)}
Balans: $${customer.balance.toFixed(2)}

📞 Aloqa: +998901234567
🏢 AzizTrades ERP

<i>Xarid uchun rahmat! 🙏</i>
    `.trim();

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Failed to send enhanced receipt:', error);
    return false;
  }
}

// To'lov tasdiqnomasi
export async function sendEnhancedPaymentConfirmation(customer: any, payment: any) {
  if (!bot || !customer.telegramChatId) return false;

  try {
    const chatId = parseInt(customer.telegramChatId);
    
    let paymentDetails = { uzs: 0, usd: 0, click: 0 };
    if (payment.paymentDetails) {
      try {
        paymentDetails = JSON.parse(payment.paymentDetails);
      } catch (e) {}
    }

    const message = `
✅ <b>TO'LOV QABUL QILINDI</b>

🆔 To'lov ID: <code>${payment.id.slice(0, 8)}</code>
📅 Sana: ${new Date(payment.createdAt).toLocaleString('uz-UZ')}
👤 Mijoz: ${customer.name}

💰 <b>To'lov Summasi:</b>
${paymentDetails.uzs > 0 ? `💵 So'm: ${paymentDetails.uzs.toLocaleString()} UZS\n` : ''}${paymentDetails.usd > 0 ? `💵 Dollar: $${paymentDetails.usd.toFixed(2)}\n` : ''}${paymentDetails.click > 0 ? `💳 Click: ${paymentDetails.click.toLocaleString()} UZS\n` : ''}
<b>Jami: $${payment.amount.toFixed(2)}</b>

💳 <b>Yangi Balans:</b>
Balans: $${customer.balance.toFixed(2)}
Qarz: $${customer.debt.toFixed(2)}

${payment.description ? `📝 Izoh: ${payment.description}\n` : ''}
✅ To'lov muvaffaqiyatli qabul qilindi!

Rahmat! 🙏
    `.trim();

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Failed to send payment confirmation:', error);
    return false;
  }
}

// Qarz eslatmasi yuborish
export async function sendDebtReminder(customer: any) {
  if (!bot || !customer.telegramChatId || !customer.notificationsEnabled) return false;

  try {
    const chatId = parseInt(customer.telegramChatId);
    
    // To'lanmagan sotuvlarni olish
    const unpaidSales = await prisma.sale.findMany({
      where: {
        customerId: customer.id,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] }
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    if (unpaidSales.length === 0) return false;

    let salesList = '';
    unpaidSales.forEach((sale, i) => {
      const debt = sale.totalAmount - sale.paidAmount;
      const date = new Date(sale.createdAt).toLocaleDateString('uz-UZ');
      salesList += `${i + 1}. ${sale.product?.name} - $${debt.toFixed(2)} (${date})\n`;
    });

    const message = `
⏰ <b>QARZ ESLATMASI</b>

👤 Hurmatli ${customer.name}!

Sizda to'lanmagan qarzlar mavjud:

💳 <b>Jami Qarz: $${customer.debt.toFixed(2)}</b>

📋 <b>To'lanmagan Sotuvlar:</b>
${salesList}

📅 To'lov muddati: ${customer.paymentTermDays} kun
💰 Kredit limit: $${customer.creditLimit.toFixed(2)}

<b>Iltimos, qarzni to'lang:</b>
• Naqd
• Plastik karta
• Click/Payme

📞 Aloqa: +998901234567

<i>Eslatma: Bu avtomatik xabar. Sozlamalarni o'zgartirish uchun /settings</i>
    `.trim();

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Failed to send debt reminder:', error);
    return false;
  }
}

// Kunlik eslatmalarni boshlash
function startDailyReminders() {
  // Har kuni soat 10:00 da eslatma yuborish
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 10 && now.getMinutes() === 0) {
      await sendDailyReminders();
    }
  }, 60000); // Har daqiqada tekshirish
}

// Kunlik eslatmalarni yuborish
async function sendDailyReminders() {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        telegramChatId: { not: null },
        notificationsEnabled: true,
        debt: { gt: 0 }
      }
    });

    for (const customer of customers) {
      // Oxirgi to'lovdan keyin necha kun o'tgan
      const daysSinceLastPayment = customer.lastPayment
        ? Math.floor((Date.now() - new Date(customer.lastPayment).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Eslatma yuborish kerakmi?
      if (daysSinceLastPayment >= customer.debtReminderDays) {
        await sendDebtReminder(customer);
        
        // Kechikish (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Failed to send daily reminders:', error);
  }
}

export { bot };
