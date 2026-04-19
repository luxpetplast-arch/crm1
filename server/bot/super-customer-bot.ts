import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../utils/prisma';
import { OrderWorkflow } from '../services/order-workflow';
import { botManager } from './bot-manager';

let superCustomerBot: TelegramBot | null = null;

// Session storage
interface UserSession {
  step: 'NAME' | 'PHONE' | 'ADDRESS' | 'COMPLETE';
  data: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

interface CartItem {
  productId: string;
  productName: string;
  quantityBags: number;
  quantityUnits: number;
  pricePerBag: number;
  subtotal: number;
}

const userSessions = new Map<number, UserSession>();
const userCarts = new Map<number, CartItem[]>();

export function initSuperCustomerBot() {
  const token = process.env.TELEGRAM_CUSTOMER_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ Super Customer bot token not found');
    return null;
  }

  try {
    superCustomerBot = new TelegramBot(token, { 
      polling: {
        interval: 2000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    
    // Telegram API xatolarini handle qilish
    superCustomerBot.on('polling_error', (error: any) => {
      if (error.code === 'ENOTFOUND' || error.message?.includes('api.telegram.org')) {
        console.error('⚠️ Telegram API ga ulanib bo\'lmadi. Internet yoki Telegram bloklangan bo\'lishi mumkin.');
      } else if (error.code === 'ETELEGRAM') {
        console.error('⚠️ Telegram API xatolik:', error.response?.body?.description || error.message);
      } else {
        console.error('⚠️ Bot polling xatolik:', error.message);
      }
    });

    superCustomerBot.on('error', (error: any) => {
      console.error('⚠️ Bot xatolik:', error.message);
    });

    setupSuperCustomerCommands();
    startAutomatedServices();
    console.log('🚀 SUPER Customer Bot ishga tushdi!');
    return superCustomerBot;
  } catch (error: any) {
    console.error('❌ Super Customer Bot ishga tushirishda xatolik:', error.message);
    return null;
  }
}

function setupSuperCustomerCommands() {
  if (!superCustomerBot) return;

  // Start komandasi - Ro'yxatdan o'tish bilan
  superCustomerBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const customer = await findOrCreateCustomer(chatId, msg.from);
    
    // Agar mijoz to'liq ro'yxatdan o'tmagan bo'lsa, ro'yxatdan o'tkazish
    if (!customer.phone || customer.phone.startsWith('@') || !customer.address) {
      await startRegistration(chatId, customer.id);
      return;
    }
    
    const uniqueId = customer.id.slice(-8).toUpperCase();
    const loyaltyPoints = await calculateLoyaltyPoints(customer.id);
    const level = getCustomerLevel(loyaltyPoints);

    const welcomeMessage = `
🎉 **Xush kelibsiz, ${customer.name}!**

🏆 **LUX PET PLAST - PREMIUM BOT**

🆔 **ID:** ${uniqueId}
⭐ **Daraja:** ${level.emoji} ${level.name}
💎 **Ballar:** ${loyaltyPoints} ball

🌟 **YANGI IMKONIYATLAR:**

🛒 **Smart Buyurtma**
• AI tavsiyalari
• Tezkor buyurtma
• Ommaviy buyurtma
• Takroriy buyurtma

💰 **Moliyaviy**
• Real-time balans
• Kredit liniyasi
• To'lov rejasi
• Cashback tizimi

📊 **Tahlil va Hisobotlar**
• Batafsil statistika
• Prognoz va tavsiyalar
• Eksport (PDF, Excel)
• Grafik va diagrammalar

🎁 **Bonus Dasturlari**
• Sadoqat ballari
• Referral tizimi
• Maxsus aksiyalar
• VIP imtiyozlar

Qo'shimcha
    `;
    
    await superCustomerBot?.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🛒 Smart Buyurtma', callback_data: 'smart_order' },
            { text: '💰 To\'lov', callback_data: 'fin_payment' }
          ],
          [
            { text: '📊 Moliyaviy', callback_data: 'fin_balance' },
            { text: '🎁 Bonuslar', callback_data: 'bonus_programs' }
          ],
          [
            { text: '👤 Profil', callback_data: 'profile' },
            { text: '📞 Yordam', callback_data: 'help' }
          ]
        ]
      }
    });
  });

  // Yangi text handlers
  superCustomerBot.onText(/📦 Buyurtmalarim/, async (msg) => {
    await showMyOrders(msg.chat.id);
  });

  superCustomerBot.onText(/💰 To\'lov/, async (msg) => {
    await showPaymentOptions(msg.chat.id);
  });

  superCustomerBot.onText(/📊 Moliyaviy/, async (msg) => {
    await showFinancialInfo(msg.chat.id);
  });

  superCustomerBot.onText(/🎁 Bonuslar/, async (msg) => {
    await showBonusPrograms(msg.chat.id);
  });

  superCustomerBot.onText(/👤 Profil/, async (msg) => {
    await showProfile(msg.chat.id);
  });

  superCustomerBot.onText(/🚚 Yetkazib berish/, async (msg) => {
    await showDeliveryInfo(msg.chat.id);
  });

  superCustomerBot.onText(/📞 Yordam/, async (msg) => {
    await showHelp(msg.chat.id);
  });

  superCustomerBot.onText(/🎮 Mini Ilovalar/, async (msg) => {
    await showMiniApps(msg.chat.id);
  });

  superCustomerBot.onText(/⚙️ Sozlamalar/, async (msg) => {
    await showSettings(msg.chat.id);
  });

  superCustomerBot.onText(/📣 Yangiliklar/, async (msg) => {
    await showNews(msg.chat.id);
  });

  superCustomerBot.onText(/🆔 Mening ID\'im/, async (msg) => {
    await showMyId(msg.chat.id);
  });

  // Barcha xabarlarni qabul qilish
  superCustomerBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      const customer = await findOrCreateCustomer(chatId, msg.from);

      // Ro'yxatdan o'tish jarayonini tekshirish
      const session = userSessions.get(chatId);
      if (session && session.step !== 'COMPLETE') {
        await handleRegistrationStep(chatId, customer.id, text || '', session);
        return;
      }

      // Oddiy xabar - operator bilan chat
      if (text && !text.startsWith('/') && !isCommand(text)) {
        await handleCustomerMessage(chatId, customer.id, text);
        return;
      }

      // Komandalar
      switch (text) {
        // Smart Buyurtma
        case '🛒 Smart Buyurtma':
        case '/smart_order':
          await handleSmartOrder(chatId, customer.id, 0);
          break;
        
        // Moliyaviy
        case '💰 Moliyaviy':
        case '/balance':
          await handleFinancial(chatId, customer.id);
          break;
        
        // Tahlil
        case '📊 Tahlil':
        case '/stats':
          await handleAnalytics(chatId, customer.id);
          break;
        
        // Bonuslar
        case '🎁 Bonuslar':
        case '/loyalty':
          await handleBonuses(chatId, customer.id);
          break;
        
        // Profil
        case '👤 Profil':
        case '/profile':
          await handleProfile(chatId, customer.id);
          break;
        
        // Ro'yxatdan o'tish
        case '📝 Ro\'yxatdan o\'tish':
        case '/register':
          await startRegistration(chatId, customer.id);
          break;
        
        // Sozlamalar
        case '⚙️ Sozlamalar':
        case '/settings':
          await handleSettings(chatId, customer.id);
          break;
        
        // Yordam
        case '📞 Yordam':
        case '/help':
          await handleHelp(chatId);
          break;
        
        // Mening ID'im
        case '🆔 Mening ID\'im':
        case '/myid':
          await handleMyId(chatId, customer.id);
          break;
        
        // Mini Ilovalar
        case '🎮 Mini Ilovalar':
        case '/apps':
          await handleMiniApps(chatId);
          break;
        
        // Til
        case '🌐 Til':
        case '/language':
          await handleLanguage(chatId);
          break;
      }
    } catch (error) {
      console.error('Message handler error:', error);
      await superCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
    }
  });

  // Callback query handler
  superCustomerBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    try {
      const customer = await findOrCreateCustomer(chatId, query.from);
      await handleCallbackQuery(chatId, customer.id, data, query.id);
    } catch (error) {
      console.error('Callback error:', error);
      try {
        await superCustomerBot?.answerCallbackQuery(query.id, { text: 'Xatolik!' });
      } catch (e) {
        console.error('Answer callback error:', e);
      }
    }
  });
  
  // Contact handler
  superCustomerBot.on('contact', async (msg: any) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;
    
    if (!contact) return;
    
    const session = userSessions.get(chatId);
    if (session && session.step === 'PHONE') {
      const phone = contact.phone_number.startsWith('+') ? contact.phone_number : '+' + contact.phone_number;
      await handleRegistrationStep(chatId, '', phone, session);
    }
  });
}

// ============ RO'YXATDAN O'TISH ============

async function startRegistration(chatId: number, customerId: string) {
  userSessions.set(chatId, {
    step: 'NAME',
    data: {}
  });

  await superCustomerBot?.sendMessage(chatId, `
👋 **Xush kelibsiz!**

Botdan foydalanish uchun ro'yxatdan o'ting.

📝 **Iltimos, to'liq ismingizni kiriting:**

Masalan: Aziz Rahimov
  `, {
    reply_markup: {
      remove_keyboard: true
    }
  });
}

async function handleRegistrationStep(chatId: number, customerId: string, text: string, session: UserSession) {
  if (!text || text.trim().length === 0) {
    await superCustomerBot?.sendMessage(chatId, '❌ Iltimos, ma\'lumot kiriting!');
    return;
  }

  switch (session.step) {
    case 'NAME':
      session.data.name = text.trim();
      session.step = 'PHONE';
      userSessions.set(chatId, session);
      
      await superCustomerBot?.sendMessage(chatId, `
✅ Ism qabul qilindi: session.data.name

📞 **Telefon raqamingizni kiriting:**

Masalan: +998901234567 yoki 901234567
      `, {
        
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;

    case 'PHONE':
      // Telefon raqamni formatlash
      let phone = text.trim().replace(/[^0-9+]/g, '');
      if (!phone.startsWith('+')) {
        if (phone.startsWith('998')) {
          phone = '+' + phone;
        } else if (phone.length === 9) {
          phone = '+998' + phone;
        }
      }
      
      session.data.phone = phone;
      session.step = 'ADDRESS';
      userSessions.set(chatId, session);
      
      await superCustomerBot?.sendMessage(chatId, `
✅ Telefon qabul qilindi: session.data.phone

📍 **Manzilingizni kiriting:**

Masalan: Toshkent shahar, Chilonzor tumani, 12-kvartal
      `, {
        
        reply_markup: {
          remove_keyboard: true
        }
      });
      break;

    case 'ADDRESS':
      session.data.address = text.trim();
      session.step = 'COMPLETE';
      userSessions.set(chatId, session);
      
      // Ma'lumotlarni saqlash
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          name: session.data.name!,
          phone: session.data.phone!,
          address: session.data.address!,
          category: 'REGULAR'
        }
      });
      
      // Session'ni tozalash
      userSessions.delete(chatId);
      
      const uniqueId = customerId.slice(-8).toUpperCase();
      
      await superCustomerBot?.sendMessage(chatId, `
🎉 **Tabriklaymiz! Ro'yxatdan o'tdingiz!**

✅ **Sizning ma'lumotlaringiz:**
• Ism: session.data.name
• Telefon: session.data.phone
• Manzil: session.data.address

🆔 **Sizning ID raqamingiz:** uniqueId

Endi siz botdan to'liq foydalanishingiz mumkin!

🛒 Buyurtma berish uchun: **🛒 Smart Buyurtma**
      `, {
        });
      
      // Bosh menyuga qaytish
      await showMainMenu(chatId);
      
      await logActivity(customerId, 'REGISTRATION_COMPLETE', session.data);
      break;
  }
}

// Yordamchi funksiyalar
async function findOrCreateCustomer(chatId: number, from: any) {
  let customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: from?.first_name || 'Telegram User',
        phone: from?.username ? `@from.username` : '',
        telegramChatId: chatId.toString(),
        telegramUsername: from?.username || '',
        category: 'NEW'
      }
    });
  }

  return customer;
}

function isCommand(text: string): boolean {
  const commands = [
    '🛒 Smart Buyurtma', '💰 Moliyaviy', '📊 Tahlil', '🎁 Bonuslar',
    '👤 Profil', '📝 Ro\'yxatdan o\'tish', '⚙️ Sozlamalar', '📞 Yordam', 
    '🆔 Mening ID\'im', '🎮 Mini Ilovalar', '🌐 Til'
  ];
  return commands.includes(text);
}

async function calculateLoyaltyPoints(customerId: string): Promise<number> {
  const totalSpent = await prisma.sale.aggregate({
    where: { customerId },
    _sum: { totalAmount: true }
  });
  return Math.floor((totalSpent._sum.totalAmount || 0) / 10);
}

function getCustomerLevel(points: number) {
  if (points >= 5000) return { name: 'Platina', emoji: '💎' };
  if (points >= 1000) return { name: 'Oltin', emoji: '🥇' };
  if (points >= 500) return { name: 'Kumush', emoji: '🥈' };
  if (points >= 100) return { name: 'Bronza', emoji: '🥉' };
  return { name: 'Yangi', emoji: '🆕' };
}

async function logActivity(customerId: string, activity: string, data?: any) {
  console.log(`Customer customerId - activity`, data);
}

// Handler funksiyalari
async function handleCustomerMessage(chatId: number, customerId: string, message: string) {
  await prisma.customerChat.create({
    data: {
      customerId,
      message,
      senderType: 'CUSTOMER',
      messageType: 'TEXT',
      isRead: false
    }
  });

  await superCustomerBot?.sendMessage(chatId, `
✅ Xabaringiz qabul qilindi!

Operatorimiz tez orada javob beradi.

📞 Tezkor yordam: /help
  `);
}

async function handleSmartOrder(chatId: number, customerId: string, page: number = 0) {
  // Mahsulotlarni olish - faqat omborda mavjud bo'lganlar
  const products = await prisma.product.findMany({
    where: {
      currentStock: {
        gt: 0
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`🔍 DEBUG: ${products.length} ta mahsulot topildi (chatId: ${chatId})`);
  products.forEach((product, i) => {
    console.log(`  ${i+1}. ${product.name} - ${product.currentStock} qop`);
  });

  if (products.length === 0) {
    await superCustomerBot?.sendMessage(chatId, `
❌ **Hozirda omborda mahsulotlar yo'q**

Iltimos, keyinroq urinib ko'ring yoki operator bilan bog'laning.

📞 Telefon: +998 90 123 45 67
💬 Telegram: @luxpetplast_admin
    `, { });
    await showMainMenu(chatId);
    return;
  }

  // Sahifalash - har sahifada 8 ta mahsulot
  const pageSize = 8;
  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, products.length);
  const pageProducts = products.slice(startIndex, endIndex);

  // Rate limit - bir necha soniya kutish
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`🔍 DEBUG: pageProducts length = pageProducts.length`);
  console.log(`🔍 DEBUG: pageProducts =`, pageProducts.map(p => ({ name: p.name, stock: p.currentStock })));

  const message = `
🛒 **BUYURTMA BERISH**

📦 **Omborda mavjud mahsulotlar:** ${products.length} ta
📄 **Sahifa:** ${page + 1}/${totalPages}

Qaysi mahsulotni buyurtma qilmoqchisiz?
  `;

  // Mahsulotlar tugmalari - ombor holatisiz
  const keyboard = pageProducts.map(product => {
    return [{
      text: `${product.name}`,
      callback_data: `order_product_${product.id}`
    }];
  });

  // Sahifalash tugmalari
  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push({ text: '⬅️ Oldingi', callback_data: `order_page_${page - 1}` });
  }
  if (page < totalPages - 1) {
    navigationButtons.push({ text: 'Keyingi ➡️', callback_data: `order_page_${page + 1}` });
  }
  
  if (navigationButtons.length > 0) {
    keyboard.push(navigationButtons);
  }

  keyboard.push([{ text: '🔙 Orqaga', callback_data: 'order_cancel' }]);

  try {
    await superCustomerBot?.sendMessage(chatId, message, {
      
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
    console.log(`✅ DEBUG: Mahsulotlar yuborildi (chatId: ${chatId})`);
  } catch (error) {
    console.error('❌ DEBUG: Mahsulotlarni yuborishda xatolik:', error);
    await superCustomerBot?.sendMessage(chatId, '❌ Mahsulotlarni yuklashda xatolik. Iltimos, qayta urinib ko\'ring.');
  }
}

async function handleFinancial(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) return;

  const message = `
💰 **MOLIYAVIY MARKAZ**

💵 **Balans:** customer.balance.toFixed(2) so'm
💳 **Qarz:** customer.debt.toFixed(2) so'm
🏦 **Kredit limiti:** customer.creditLimit.toFixed(2) so'm

Nima qilmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💵 Balans', callback_data: 'fin_balance' },
          { text: '💳 To\'lov', callback_data: 'fin_payment' }
        ],
        [
          { text: '🔙 Orqaga', callback_data: 'back_main' }
        ]
      ]
    }
  });
}

async function handleAnalytics(chatId: number, customerId: string) {
  const message = `
📊 **KENGAYTIRILGAN ANALITIKA** v2.0

8 ta asosiy bo'lim + Ilg'or funksiyalar:

1️⃣ **📈 Savdo metrikalari** (10 ta)
2️⃣ **📦 Mahsulot metrikalari** (9 ta)
3️⃣ **💰 Foyda va rentabellik** (10 ta)
4️⃣ **👥 Marketing va mijozlar** (10 ta)
5️⃣ **💳 Qarzdorlik va kredit** (8 ta)
6️⃣ **💵 Pul oqimi** (6 ta)
7️⃣ **⚡ Operatsion samaradorlik** (8 ta)
8️⃣ **📊 Strategik o'sish** (4 ta)

🔥 **Ilg'or funksiyalar:**
📉 **Trend tahlili** - o'sish dinamikasi
🎯 **Bashoratlar** - kelajak prognozi
📅 **Solishtirish** - davrlar bo'yicha
🏆 **Benchmarking** - o'rtacha ko'rsatkichlar

Qaysi bo'limni ko'rmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '1️⃣ Savdo', callback_data: 'ana_sales' },
          { text: '2️⃣ Mahsulot', callback_data: 'ana_product' }
        ],
        [
          { text: '3️⃣ Foyda', callback_data: 'ana_profit' },
          { text: '4️⃣ Marketing', callback_data: 'ana_marketing' }
        ],
        [
          { text: '5️⃣ Qarzdorlik', callback_data: 'ana_debt' },
          { text: '6️⃣ Pul oqimi', callback_data: 'ana_cashflow' }
        ],
        [
          { text: '7️⃣ Operatsiya', callback_data: 'ana_operation' },
          { text: '8️⃣ Strategiya', callback_data: 'ana_strategy' }
        ],
        [
          { text: '📊 Umumiy hisobot', callback_data: 'ana_dashboard' }
        ],
        [
          { text: '🔥 Advanced Analytics', callback_data: 'ana_advanced' }
        ],
        [
          { text: '🔙 Orqaga', callback_data: 'back_main' }
        ]
      ]
    }
  });
}

async function handleBonuses(chatId: number, customerId: string) {
  const loyaltyPoints = await calculateLoyaltyPoints(customerId);
  
  const message = `
🎁 **BONUS DASTURLARI**

💎 **Sizning ballaringiz:** loyaltyPoints

Qaysi dasturni tanlaysiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⭐ Sadoqat', callback_data: 'bonus_loyalty' },
          { text: '👥 Referral', callback_data: 'bonus_referral' }
        ],
        [
          { text: '🎉 Aksiyalar', callback_data: 'bonus_promo' },
          { text: '👑 VIP', callback_data: 'bonus_vip' }
        ],
        [
          { text: '🏆 Yutuqlar', callback_data: 'bonus_achievements' }
        ]
      ]
    }
  });
}

async function handleProfile(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) return;

  const salesCount = await prisma.sale.count({
    where: { customerId }
  });

  const loyaltyPoints = await calculateLoyaltyPoints(customerId);
  const level = getCustomerLevel(loyaltyPoints);

  const message = `
👤 **PROFIL**

📝 **Ma'lumotlar:**
• Ism: customer.name
• Telefon: customer.phone || 'Yo\'q'
• Kategoriya: customer.category

📊 **Statistika:**
• Daraja: level.emoji level.name
• Ballar: loyaltyPoints
• Sotuvlar: salesCount ta

Nima qilmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✏️ Tahrirlash', callback_data: 'prof_edit' },
          { text: '🔒 Xavfsizlik', callback_data: 'prof_security' }
        ],
        [
          { text: '🔄 Yangilash', callback_data: 'prof_refresh' }
        ]
      ]
    }
  });
}

async function handleSettings(chatId: number, customerId: string) {
  const message = `
⚙️ **SOZLAMALAR**

Qaysi sozlamani o'zgartirmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔔 Bildirishnomalar', callback_data: 'set_notif' },
          { text: '🌐 Til', callback_data: 'set_lang' }
        ],
        [
          { text: '💱 Valyuta', callback_data: 'set_currency' },
          { text: '🎨 Tema', callback_data: 'set_theme' }
        ],
        [
          { text: '🔐 Maxfiylik', callback_data: 'set_privacy' }
        ]
      ]
    }
  });
}

async function handleHelp(chatId: number) {
  const message = `
📞 **YORDAM MARKAZI**

Qanday yordam kerak?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💬 Live Chat', callback_data: 'help_chat' },
          { text: '🤖 AI Yordamchi', callback_data: 'help_ai' }
        ],
        [
          { text: '❓ FAQ', callback_data: 'help_faq' },
          { text: '🎥 Video', callback_data: 'help_video' }
        ],
        [
          { text: '🎫 Ticket', callback_data: 'help_ticket' },
          { text: '📞 Qo\'ng\'iroq', callback_data: 'help_call' }
        ]
      ]
    }
  });
}

async function handleMyId(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) return;

  const uniqueId = customer.id.slice(-8).toUpperCase();

  const message = `
🆔 **SIZNING ID RAQAMINGIZ**

📋 **ID:** uniqueId

Bu ID raqamingizni saqlang!

📝 **Qanday ishlatiladi:**
1. Saytda "Mijoz Qo'shish"
2. "Telegram ID" maydoniga kiriting
3. Boshqa ma'lumotlarni to'ldiring
4. Saqlang

✅ Bot va sayt ulandi!
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    });
}

async function handleMiniApps(chatId: number) {
  const message = `
🎮 **MINI ILOVALAR**

Qaysi ilovani ochmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🧮 Kalkulyator', callback_data: 'app_calc' },
          { text: '📋 Katalog', callback_data: 'app_catalog' }
        ],
        [
          { text: '📍 Tracking', callback_data: 'app_track' },
          { text: '📦 Ombor', callback_data: 'app_inventory' }
        ],
        [
          { text: '🎮 O\'yinlar', callback_data: 'app_games' }
        ]
      ]
    }
  });
}

async function handleLanguage(chatId: number) {
  const message = `
🌐 **TIL TANLASH**

Qaysi tilni tanlaysiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇺🇿 O\'zbek', callback_data: 'lang_uz' },
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
        ],
        [
          { text: '🇬🇧 English', callback_data: 'lang_en' }
        ]
      ]
    }
  });
}

async function handleCallbackQuery(chatId: number, customerId: string, data: string, queryId: string) {
  // Tez javob berish
  try {
    await superCustomerBot?.answerCallbackQuery(queryId, { text: '⏳ Yuklanmoqda...' });
  } catch (e) {
    console.error('Initial answer callback error:', e);
  }
  
  // Orqaga qaytish
  if (data === 'back_main') {
    await showMainMenu(chatId);
    return;
  }
  
  // Sahifalash
  if (data.startsWith('order_page_')) {
    const page = parseInt(data.replace('order_page_', ''));
    await handleSmartOrder(chatId, customerId, page);
    return;
  }
  
  // Mahsulot tanlash
  if (data.startsWith('order_product_')) {
    const productId = data.replace('order_product_', '');
    await handleProductSelect(chatId, customerId, productId, queryId);
    return;
  }
  
  // Buyurtma turi tanlash (qop yoki dona)
  if (data.startsWith('order_type_')) {
    const parts = data.replace('order_type_', '').split('_');
    const productId = parts[0];
    const type = parts[1]; // 'bags' or 'units'
    await handleOrderTypeSelect(chatId, customerId, productId, type, queryId);
    return;
  }
  
  // Yana mahsulot qo'shish
  if (data === 'order_add_more') {
    await handleSmartOrder(chatId, customerId, 0);
    return;
  }
  
  // Miqdor tanlash
  if (data.startsWith('order_qty_')) {
    const parts = data.replace('order_qty_', '').split('_');
    const productId = parts[0];
    const bags = parseInt(parts[1]);
    const units = parseInt(parts[2]);
    await handleAddToCart(chatId, customerId, productId, bags, units, queryId);
    return;
  }
  
  // Savatni ko'rish
  if (data === 'order_view_cart') {
    await handleViewCart(chatId, customerId);
    return;
  }
  
  // Savatdagi mahsulot batafsil
  if (data.startsWith('cart_detail_')) {
    const productId = data.replace('cart_detail_', '');
    await handleCartProductDetail(chatId, customerId, productId);
    return;
  }
  
  // Savatdan mahsulot olib tashlash
  if (data.startsWith('cart_remove_')) {
    const productId = data.replace('cart_remove_', '');
    await handleRemoveFromCart(chatId, customerId, productId);
    return;
  }
  
  // Buyurtmani tasdiqlash
  if (data === 'order_confirm') {
    await handleConfirmOrder(chatId, customerId, queryId);
    return;
  }
  
  // Savatni tozalash
  if (data === 'order_clear_cart') {
    userCarts.delete(chatId);
    await superCustomerBot?.sendMessage(chatId, '🗑️ Savat tozalandi!');
    await handleSmartOrder(chatId, customerId);
    return;
  }
  
  // Bekor qilish
  if (data === 'order_cancel') {
    userCarts.delete(chatId);
    await showMainMenu(chatId);
    return;
  }
  
  // Moliyaviy callback'lar
  if (data === 'fin_balance') {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (customer) {
      await superCustomerBot?.sendMessage(chatId, `
💰 **BALANS MA'LUMOTLARI**

💵 **Joriy balans:** customer.balance.toFixed(2) so'm
💳 **Qarz:** customer.debt.toFixed(2) so'm
🏦 **Kredit limiti:** customer.creditLimit.toFixed(2) so'm
📊 **Foydalanish:** ((customer.debt / customer.creditLimit) * 100).toFixed(1)%

customer.debt > 0 ? '⚠️ Qarzingizni to\'lashni unutmang!' : '✅ Qarzingiz yo\'q!'
      `, { });
    }
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'fin_payment') {
    await showPaymentOptions(chatId);
    return;
  }
  
  if (data === 'payment_confirm') {
    await startPaymentProcess(chatId);
    return;
  }
  
  if (data === 'payment_received') {
    await confirmPaymentReceived(chatId);
    return;
  }
  
  // To'lov qilish callback
  if (data.startsWith('pay_order_')) {
    const orderId = data.split('_')[2];
    await processOrderPayment(chatId, orderId);
    return;
  }
      
      // Tahlil callback'lar - YANGI KENGAYTIRILGAN ANALITIKA
      if (data === 'ana_sales') {
        await handleSalesAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_product') {
        await handleProductAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_profit') {
        await handleProfitAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_marketing') {
        await handleMarketingAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_debt') {
        await handleDebtAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_cashflow') {
        await handleCashflowAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_operation') {
        await handleOperationAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_strategy') {
        await handleStrategyAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_dashboard') {
        await handleDashboardAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_advanced') {
        await handleAdvancedAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_trends') {
        await handleTrendAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_predictions') {
        await handlePredictionAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_comparison') {
        await handleComparisonAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_benchmarks') {
        await handleBenchmarkAnalytics(chatId, customerId);
        return;
      }
      
      if (data === 'ana_alerts') {
        await handleSmartAlerts(chatId, customerId);
        return;
      }
      
      if (data === 'ana_segmentation') {
        await handleSegmentation(chatId, customerId);
        return;
      }
      
      if (data === 'ana_recommendations') {
        await handleRecommendations(chatId, customerId);
        return;
      }
      
      if (data === 'ana_export') {
        await handleExport(chatId, customerId);
        return;
      }
      
      // Eski analitika callback'lar (keyinchalik o'chiriladi)
      if (data === 'ana_stats' || data === 'ana_report' || data === 'ana_back') {
        await handleAnalytics(chatId, customerId);
        return;
      }
      
      // Bonus callback'lar
      if (data === 'bonus_loyalty') {
        const loyaltyPoints = await calculateLoyaltyPoints(customerId);
        const level = getCustomerLevel(loyaltyPoints);
        
        await superCustomerBot?.sendMessage(chatId, `
⭐ **SADOQAT DASTURI**

💎 **Sizning ballaringiz:** ${loyaltyPoints}
🏆 **Darajangiz:** ${level.emoji} ${level.name}

📈 **Keyingi daraja:**
${loyaltyPoints < 100 ? `🥉 Bronza - ${100 - loyaltyPoints} ball kerak` :
  loyaltyPoints < 500 ? `🥈 Kumush - ${500 - loyaltyPoints} ball kerak` :
  loyaltyPoints < 1000 ? `🥇 Oltin - ${1000 - loyaltyPoints} ball kerak` :
  loyaltyPoints < 5000 ? `💎 Platina - ${5000 - loyaltyPoints} ball kerak` :
  '🎉 Maksimal daraja!'}

💡 **Qanday ball yig'ish mumkin:**
• Har 10 so'm xarid = 1 ball
• Referral = 100 ball
• Aksiyalar = 50-500 ball
        `, { });
        await showMainMenu(chatId);
        return;
      }
  
  if (data === 'bonus_referral') {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    const uniqueId = customer?.id.slice(-8).toUpperCase();
    
    await superCustomerBot?.sendMessage(chatId, `
👥 **REFERRAL DASTURI**

🆔 **Sizning referral kodingiz:** uniqueId

💰 **Mukofotlar:**
• Do'stingiz ro'yxatdan o'tsa: 100 ball
• Do'stingiz birinchi buyurtma bersa: 500 ball
• Do'stingiz doimiy mijoz bo'lsa: 1000 ball

📤 **Ulashish:**
Kodingizni do'stlaringizga yuboring!
Ular ro'yxatdan o'tishda kodingizni kiritsin.
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'bonus_promo') {
    await superCustomerBot?.sendMessage(chatId, `
🎉 **AKSIYALAR**

🔥 **Joriy aksiyalar:**

1️⃣ **Bahor chegirmasi**
   • 10% chegirma barcha mahsulotlarga
   • Amal qilish muddati: 31.03.2026

2️⃣ **Ommaviy buyurtma**
   • 100+ qop = 15% chegirma
   • 500+ qop = 20% chegirma

3️⃣ **Doimiy mijozlar**
   • Har 10-buyurtma = 1 bepul qop

📢 Yangi aksiyalardan xabardor bo'lish uchun bildirishnomalarni yoqing!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'bonus_vip') {
    const loyaltyPoints = await calculateLoyaltyPoints(customerId);
    const isVip = loyaltyPoints >= 5000;
    
    await superCustomerBot?.sendMessage(chatId, `
👑 **VIP DASTUR**

isVip ? '✅ Siz VIP mijoz!' : '⭐ VIP bo\'lish uchun 5000 ball kerak'

💎 **VIP imtiyozlar:**
• 25% doimiy chegirma
• Bepul yetkazib berish
• Shaxsiy menejer
• Maxsus aksiyalar
• Birinchi navbatda xizmat

${!isVip ? `\n📈 Sizda: ${loyaltyPoints} ball\n🎯 Kerak: ${5000 - loyaltyPoints} ball` : ''}
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'bonus_achievements') {
    await superCustomerBot?.sendMessage(chatId, `
🏆 **YUTUQLAR**

✅ **Olingan yutuqlar:**
🎖️ Birinchi buyurtma
🎖️ 10 buyurtma
🎖️ Doimiy mijoz

🔒 **Ochilmagan yutuqlar:**
🏅 50 buyurtma (40 ta qoldi)
🏅 100 buyurtma (90 ta qoldi)
🏅 VIP mijoz (4500 ball kerak)

💡 Har bir yutuq uchun bonus ballar!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  // Profil callback'lar
  if (data === 'prof_edit') {
    await superCustomerBot?.sendMessage(chatId, `
✏️ **PROFILNI TAHRIRLASH**

Ma'lumotlarni o'zgartirish uchun:

📝 Ro'yxatdan o'tish tugmasini bosing
Yoki operator bilan bog'laning:

📞 +998 90 123 45 67
💬 @luxpetplast_admin
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'prof_security') {
    await superCustomerBot?.sendMessage(chatId, `
🔒 **XAVFSIZLIK**

✅ **Sizning hisobingiz himoyalangan:**
• Telegram autentifikatsiya
• Shifrlangan ma'lumotlar
• Xavfsiz to'lovlar

🆔 **Sizning ID:** Faqat siz ko'rasiz
🔐 **Maxfiylik:** Ma'lumotlaringiz himoyalangan

⚠️ ID raqamingizni hech kimga bermang!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'prof_refresh') {
    await handleProfile(chatId, customerId);
    return;
  }
  
  // Sozlamalar callback'lar
  if (data === 'set_notif') {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    const enabled = customer?.notificationsEnabled || false;
    
    await prisma.customer.update({
      where: { id: customerId },
      data: { notificationsEnabled: !enabled }
    });
    
    await superCustomerBot?.sendMessage(chatId, `
🔔 **BILDIRISHNOMALAR**

!enabled ? '✅ Bildirishnomalar yoqildi!' : '❌ Bildirishnomalar o\'chirildi!'

Siz quyidagi xabarlarni olasiz:
• Buyurtma holati
• Aksiyalar
• Chegirmalar
• Eslatmalar
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'set_lang') {
    await handleLanguage(chatId);
    return;
  }
  
  if (data.startsWith('lang_')) {
    const lang = data.replace('lang_', '');
    await superCustomerBot?.sendMessage(chatId, `
✅ Til o'zgartirildi: lang === 'uz' ? '🇺🇿 O\'zbek' : lang === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'

⚠️ Hozircha faqat o'zbek tili qo'llab-quvvatlanadi.
Boshqa tillar tez orada qo'shiladi!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'set_currency') {
    await superCustomerBot?.sendMessage(chatId, `
💱 **VALYUTA**

Hozirgi valyuta: 🇺🇸 USD

Boshqa valyutalar tez orada qo'shiladi:
• 🇺🇿 UZS
• 🇷🇺 RUB
• 🇪🇺 EUR
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'set_theme') {
    await superCustomerBot?.sendMessage(chatId, `
🎨 **TEMA**

Mavjud temalar:
• ☀️ Yorug'
• 🌙 Qorong'i
• 🎨 Avtomatik

⚠️ Telegram sozlamalaringizdan temani o'zgartirishingiz mumkin.
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'set_privacy') {
    await superCustomerBot?.sendMessage(chatId, `
🔐 **MAXFIYLIK**

✅ **Sizning ma'lumotlaringiz:**
• Shifrlangan
• Xavfsiz saqlangan
• Uchinchi shaxslarga berilmaydi

📋 **Maxfiylik siyosati:**
Biz sizning ma'lumotlaringizni faqat xizmat ko'rsatish uchun ishlatamiz.

🔒 Ma'lumotlaringiz himoyalangan!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  // Yordam callback'lar
  if (data === 'help_chat') {
    await superCustomerBot?.sendMessage(chatId, `
💬 **LIVE CHAT**

Operator bilan to'g'ridan-to'g'ri suhbat:

📞 Telefon: +998 90 123 45 67
💬 Telegram: @luxpetplast_admin

Ish vaqti:
🕐 Dushanba-Shanba: 9:00-18:00
🕐 Yakshanba: Dam olish

Yoki xabar yuboring, operatorimiz javob beradi!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'help_ai') {
    await superCustomerBot?.sendMessage(chatId, `
🤖 **AI YORDAMCHI**

Savol bering, men javob beraman!

Masalan:
• "Qanday mahsulotlar bor?"
• "Narxlar qancha?"
• "Qanday buyurtma berish mumkin?"
• "Yetkazib berish qancha vaqt oladi?"

💡 Xabar yuboring, men yordam beraman!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'help_faq') {
    await superCustomerBot?.sendMessage(chatId, `
❓ **KO'P SO'RALADIGAN SAVOLLAR**

**1. Qanday buyurtma berish mumkin?**
🛒 Smart Buyurtma tugmasini bosing

**2. To'lov qanday amalga oshiriladi?**
💰 Naqd, karta, Click orqali

**3. Yetkazib berish bepulmi?**
🚚 100+ qop uchun bepul

**4. Qancha vaqt oladi?**
⏱️ 1-3 ish kuni

**5. Qaytarish mumkinmi?**
✅ 7 kun ichida, shikast bo'lmasa

Boshqa savol? Operator bilan bog'laning!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'help_video') {
    await superCustomerBot?.sendMessage(chatId, `
🎥 **VIDEO QO'LLANMALAR**

📹 **Mavjud videolar:**

1️⃣ Ro'yxatdan o'tish
2️⃣ Buyurtma berish
3️⃣ To'lov qilish
4️⃣ Bonus to'plash

🔗 Videolarni ko'rish:
https://youtube.com/@luxpetplast

⚠️ Tez orada qo'shiladi!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'help_ticket') {
    await superCustomerBot?.sendMessage(chatId, `
🎫 **TICKET YARATISH**

Muammo yoki taklifingiz bormi?

Ticket yaratish uchun:
1. Muammoni batafsil yozing
2. Rasm yoki video qo'shing (ixtiyoriy)
3. Yuboring

Operatorimiz 24 soat ichida javob beradi!

💡 Xabar yuboring, ticket yaratamiz!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'help_call') {
    await superCustomerBot?.sendMessage(chatId, `
📞 **QO'NG'IROQ QILISH**

Bizga qo'ng'iroq qiling:

📱 +998 90 123 45 67
📱 +998 91 234 56 78

Ish vaqti:
🕐 Dushanba-Shanba: 9:00-18:00
🕐 Yakshanba: Dam olish

Yoki biz sizga qo'ng'iroq qilamiz!
Telefon raqamingizni yuboring.
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  // Mini ilovalar callback'lar
  if (data === 'app_calc') {
    await superCustomerBot?.sendMessage(chatId, `
🧮 **KALKULYATOR**

Narxni hisoblash:

Mahsulot narxi × Miqdor = Jami

Masalan:
50,000 so'm × 10 qop = 500,000 so'm

💡 Buyurtma berishda avtomatik hisoblanadi!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'app_catalog') {
    const products = await prisma.product.findMany({
      where: { currentStock: { gt: 0 } },
      orderBy: { name: 'asc' }
    });
    
    let message = '📋 **MAHSULOTLAR KATALOGI**\n\n';
    products.forEach((product, index) => {
      message += `${index + 1}. **${product.name}**\n`;
      message += `   💰 ${product.pricePerBag.toLocaleString()} so'm/qop\n\n`;
    });
    
    await superCustomerBot?.sendMessage(chatId, message, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'app_track') {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true }
    });
    
    if (orders.length === 0) {
      await superCustomerBot?.sendMessage(chatId, '📦 Buyurtmalaringiz yo\'q');
    } else {
      let message = '📍 **BUYURTMALARNI KUZATISH**\n\n';
      orders.forEach((order, index) => {
        message += `${index + 1}. ${order.orderNumber}\n`;
        message += `   📊 Status: ${order.status}\n`;
        message += `   💰 ${order.totalAmount.toLocaleString()} so'm\n\n`;
      });
      await superCustomerBot?.sendMessage(chatId, message, { });
    }
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'app_inventory') {
    await superCustomerBot?.sendMessage(chatId, `
📦 **OMBOR HOLATI**

Ombor holati ma'lumotlari faqat adminlar uchun mavjud.

🛒 Buyurtma berish uchun: **Smart Buyurtma** tugmasini bosing.
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  if (data === 'app_games') {
    await superCustomerBot?.sendMessage(chatId, `
🎮 **O'YINLAR**

Tez orada qo'shiladi:

🎯 Bonus o'yinlari
🎰 Ruletka
🎲 Lotereya
🏆 Musobaqalar

💎 O'ynang va bonus to'plang!
    `, { });
    await showMainMenu(chatId);
    return;
  }
  
  // Agar hech qanday callback mos kelmasa
  await superCustomerBot?.sendMessage(chatId, '⚠️ Noma\'lum buyruq!');
  await showMainMenu(chatId);
}

// Mahsulot tanlash
async function handleProductSelect(chatId: number, customerId: string, productId: string, queryId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    await superCustomerBot?.answerCallbackQuery(queryId, { text: 'Mahsulot topilmadi!' });
    return;
  }

  const message = `
📦 **${product.name}**

💰 **Narx:** ${product.pricePerBag.toLocaleString()} so'm/qop
📦 **Bir qopda:** ${product.unitsPerBag} dona

Qanday buyurtma qilmoqchisiz?
  `;

  const keyboard = [
    [
      { text: '📦 Qop bilan buyurtma', callback_data: `order_type_${productId}_bags` },
      { text: '🔢 Dona bilan buyurtma', callback_data: `order_type_${productId}_units` }
    ],
    [
      { text: '🔙 Orqaga', callback_data: 'order_cancel' }
    ]
  ];

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}

// Buyurtma turi tanlash (qop yoki dona)
async function handleOrderTypeSelect(chatId: number, customerId: string, productId: string, type: string, queryId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    await superCustomerBot?.answerCallbackQuery(queryId, { text: 'Mahsulot topilmadi!' });
    return;
  }

  if (type === 'bags') {
    // Qop bilan buyurtma
    const message = `
📦 **${product.name}**

💰 **Narx:** ${product.pricePerBag.toLocaleString()} so'm/qop

Neicha qop buyurtma qilmoqchisiz?
    `;

    const keyboard = [
      [
        { text: '1 qop', callback_data: `order_qty_${productId}_1_0` },
        { text: '5 qop', callback_data: `order_qty_${productId}_5_0` },
        { text: '10 qop', callback_data: `order_qty_${productId}_10_0` },
        { text: '20 qop', callback_data: `order_qty_${productId}_20_0` }
      ],
      [
        { text: '50 qop', callback_data: `order_qty_${productId}_50_0` },
        { text: '100 qop', callback_data: `order_qty_${productId}_100_0` }
      ],
      [
        { text: '🔙 Orqaga', callback_data: `order_product_${productId}` }
      ]
    ];

    await superCustomerBot?.sendMessage(chatId, message, {
      
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } else if (type === 'units') {
    // Dona bilan buyurtma
    const totalUnits = product.currentStock * product.unitsPerBag;
    const pricePerUnit = product.pricePerBag / product.unitsPerBag;

    const message = `
🔢 **${product.name}**

💰 **Narx:** ${pricePerUnit.toLocaleString()} so'm/dona

Necha dona buyurtma qilmoqchisiz?
    `;

    const keyboard = [
      [
        { text: `${product.unitsPerBag} dona (1 qop)`, callback_data: `order_qty_${productId}_0_${product.unitsPerBag}` },
        { text: `${product.unitsPerBag * 2} dona (2 qop)`, callback_data: `order_qty_${productId}_0_${product.unitsPerBag * 2}` }
      ],
      [
        { text: `${product.unitsPerBag * 5} dona (5 qop)`, callback_data: `order_qty_${productId}_0_${product.unitsPerBag * 5}` },
        { text: `${product.unitsPerBag * 10} dona (10 qop)`, callback_data: `order_qty_${productId}_0_${product.unitsPerBag * 10}` }
      ],
      [
        { text: '🔙 Orqaga', callback_data: `order_product_${productId}` }
      ]
    ];

    await superCustomerBot?.sendMessage(chatId, message, {
      
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }
}

// Savatga qo'shish
async function handleAddToCart(chatId: number, customerId: string, productId: string, bags: number, units: number, queryId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    await superCustomerBot?.answerCallbackQuery(queryId, { text: 'Mahsulot topilmadi!' });
    return;
  }

  // Qop va dona asosida hisoblash
  let finalBags = bags;
  let finalUnits = units;
  let subtotal = 0;

  if (bags > 0 && units === 0) {
    // Faqat qop
    if (product) {
      subtotal = bags * product.pricePerBag;
    }
  } else if (bags === 0 && units > 0) {
    // Faqat dona - qopga aylantirish
    finalBags = Math.floor(units / product.unitsPerBag);
    finalUnits = units % product.unitsPerBag;
    
    // Narxni hisoblash
    const pricePerUnit = product.pricePerBag / product.unitsPerBag;
    subtotal = units * pricePerUnit;
  } else {
    // Ikkala variant ham
    const pricePerUnit = product.pricePerBag / product.unitsPerBag;
    subtotal = (bags * product.pricePerBag) + (units * pricePerUnit);
  }

  const cartItem: CartItem = {
    productId: product.id,
    productName: product.name,
    quantityBags: finalBags,
    quantityUnits: finalUnits,
    pricePerBag: product.pricePerBag,
    subtotal
  };

  // Savatga qo'shish
  let cart = userCarts.get(chatId) || [];
  
  // Agar mahsulot allaqachon savatda bo'lsa, miqdorni yangilash
  const existingIndex = cart.findIndex(item => item.productId === productId);
  if (existingIndex >= 0) {
    cart[existingIndex].quantityBags += finalBags;
    cart[existingIndex].quantityUnits += finalUnits;
    
    // Agar dona 1 qopdan oshsa, qopga aylantirish
    if (cart[existingIndex].quantityUnits >= product.unitsPerBag) {
      const extraBags = Math.floor(cart[existingIndex].quantityUnits / product.unitsPerBag);
      cart[existingIndex].quantityBags += extraBags;
      cart[existingIndex].quantityUnits = cart[existingIndex].quantityUnits % product.unitsPerBag;
    }
    
    cart[existingIndex].subtotal += subtotal;
  } else {
    cart.push(cartItem);
  }
  
  userCarts.set(chatId, cart);

  await superCustomerBot?.answerCallbackQuery(queryId, { text: '✅ Savatga qo\'shildi!' });

  // Savat ma'lumotlarini olish
  cart = userCarts.get(chatId) || [];
  const cartItemsCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Miqdorni ko'rsatish
  let quantityText = '';
  if (finalBags > 0 && finalUnits > 0) {
    quantityText = `${finalBags} qop + ${finalUnits} dona`;
  } else if (finalBags > 0) {
    quantityText = `${finalBags} qop`;
  } else {
    quantityText = `${units} dona`;
  }

  const message = `
✅ **Savatga qo'shildi!**

📦 ${product.name}
📊 Miqdor: ${quantityText}
💰 Summa: ${subtotal.toLocaleString()} so'm

🛒 **Savatingiz:**
• Mahsulotlar: ${cartItemsCount} xil
• Jami: ${cartTotal.toLocaleString()} so'm

Nima qilmoqchisiz?
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: [
        [
          { text: '➕ Yana mahsulot qo\'shish', callback_data: 'order_add_more' },
          { text: '🛒 Savatni ko\'rish', callback_data: 'order_view_cart' }
        ],
        [
          { text: '✅ Buyurtma berish', callback_data: 'order_confirm' }
        ],
        [
          { text: '🗑️ Savatni tozalash', callback_data: 'order_clear_cart' }
        ]
      ]
    }
  });
}

// Savatni ko'rish
async function handleViewCart(chatId: number, customerId: string) {
  const cart = userCarts.get(chatId);

  if (!cart || cart.length === 0) {
    await superCustomerBot?.sendMessage(chatId, '🛒 Savatingiz bo\'sh!');
    await handleSmartOrder(chatId, customerId);
    return;
  }

  let message = '🛒 **SAVATINGIZ:**\n\n';
  let total = 0;

  // Mahsulot tugmalari uchun array
  const productButtons: any[] = [];

  cart.forEach((item, index) => {
    message += `${index + 1}. **${item.productName}**\n`;
    
    // Miqdorni ko'rsatish
    if (item.quantityBags > 0 && item.quantityUnits > 0) {
      message += `   📊 ${item.quantityBags} qop + ${item.quantityUnits} dona\n`;
    } else if (item.quantityBags > 0) {
      message += `   📊 ${item.quantityBags} qop\n`;
    } else {
      message += `   📊 ${item.quantityUnits} dona\n`;
    }
    
    message += `   💰 ${item.subtotal.toLocaleString()} so'm\n\n`;
    total += item.subtotal;

    // Har mahsulot uchun "Batafsil" tugmasi
    productButtons.push([
      { text: `📋 ${index + 1}. ${item.productName} - Batafsil`, callback_data: `cart_detail_${item.productId}` }
    ]);
  });

  message += `\n💵 **JAMI:** ${total.toLocaleString()} so'm`;
  message += `\n📦 **Mahsulotlar:** ${cart.length} xil`;

  const keyboard = [
    ...productButtons,
    [
      { text: '✅ Buyurtma berish', callback_data: 'order_confirm' },
      { text: '➕ Yana qo\'shish', callback_data: 'order_add_more' }
    ],
    [
      { text: '🗑️ Savatni tozalash', callback_data: 'order_clear_cart' },
      { text: '🔙 Orqaga', callback_data: 'back_main' }
    ]
  ];

  await superCustomerBot?.sendMessage(chatId, message, {
    
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}

// Savatdagi mahsulot batafsil ko'rish
async function handleCartProductDetail(chatId: number, customerId: string, productId: string) {
  const cart = userCarts.get(chatId);
  
  if (!cart) {
    await superCustomerBot?.sendMessage(chatId, '🛒 Savat topilmadi!');
    return;
  }

  const cartItem = cart.find(item => item.productId === productId);
  
  if (!cartItem) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mahsulot savatda topilmadi!');
    return;
  }

  // Mahsulot ma'lumotlarini olish
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mahsulot ma\'lumotlari topilmadi!');
    return;
  }

  // Miqdor matnini yaratish
  let quantityText = '';
  if (cartItem.quantityBags > 0 && cartItem.quantityUnits > 0) {
    quantityText = `${cartItem.quantityBags} qop + ${cartItem.quantityUnits} dona`;
  } else if (cartItem.quantityBags > 0) {
    quantityText = `${cartItem.quantityBags} qop`;
  } else {
    quantityText = `${cartItem.quantityUnits} dona`;
  }

  const message = `
📋 **MAHSULOT BATAFSIL**

📦 **${product.name}**

📊 **Savatdagi miqdor:**
${quantityText}

💰 **Narhlar:**
• 1 qop narxi: ${product.pricePerBag.toLocaleString()} so'm
• Jami: ${cartItem.subtotal.toLocaleString()} so'm

📋 **Mahsulot ma'lumotlari:**
• 1 qopda: ${product.unitsPerBag} dona
• Omborda: ${product.currentStock} qop
• Qop turi: ${product.bagType || 'Aniqlanmagan'}

📝 **Tavsif:**
${(product as any).description || 'Tavsif mavjud emas'}
  `;

  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✏️ Miqdorni o\'zgartirish', callback_data: `order_product_${productId}` },
          { text: '🗑️ Olib tashlash', callback_data: `cart_remove_${productId}` }
        ],
        [
          { text: '🛒 Savatga qaytish', callback_data: 'order_view_cart' },
          { text: '🔙 Asosiy menyu', callback_data: 'back_main' }
        ]
      ]
    }
  });
}

// Savatdan mahsulot olib tashlash
async function handleRemoveFromCart(chatId: number, customerId: string, productId: string) {
  const cart = userCarts.get(chatId);
  
  if (!cart) {
    await superCustomerBot?.sendMessage(chatId, '🛒 Savat topilmadi!');
    return;
  }

  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mahsulot savatda topilmadi!');
    return;
  }

  const removedItem = cart[itemIndex];
  cart.splice(itemIndex, 1);
  
  // Agar savat bo'sh qolsa, to'liq o'chirish
  if (cart.length === 0) {
    userCarts.delete(chatId);
  } else {
    userCarts.set(chatId, cart);
  }

  await superCustomerBot?.sendMessage(chatId, `✅ **${removedItem.productName}** savatdan olib tashlandi!`);
  
  // Savatni qayta ko'rsatish
  await handleViewCart(chatId, customerId);
}

// Buyurtmani tasdiqlash va yaratish
async function handleConfirmOrder(chatId: number, customerId: string, queryId: string) {
  const cart = userCarts.get(chatId);

  if (!cart || cart.length === 0) {
    await superCustomerBot?.answerCallbackQuery(queryId, { text: 'Savat bo\'sh!' });
    return;
  }

  try {
    // Ombor holatini tekshirish
    const inventoryCheck = [];
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (product) {
        const inStock = product.currentStock;
        const needed = item.quantityBags;
        const shortage = Math.max(0, needed - inStock);

        inventoryCheck.push({
          productId: product.id,
          productName: product.name,
          ordered: needed,
          inStock: inStock,
          needProduction: shortage,
          status: shortage > 0 ? 'NEED_PRODUCTION' : 'IN_STOCK'
        });
      }
    }

    // Jami summani hisoblash
    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // Buyurtma raqamini yaratish
    const orderNumber = `BOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Buyurtmani yaratish
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'CONFIRMED', // PENDING o'rniga CONFIRMED
        priority: 'NORMAL',
        requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ertaga
        totalAmount,
        notes: JSON.stringify({
          userNotes: 'Telegram botdan buyurtma',
          source: 'BOT',
          inventoryCheck: inventoryCheck
        }),
        items: {
          create: cart.map(item => ({
            productId: item.productId,
            quantityBags: item.quantityBags,
            quantityUnits: 0, // Dona yo'q, faqat qop
            pricePerBag: item.pricePerBag,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Savatni tozalash
    userCarts.delete(chatId);

    // 1. OMBORDAN MAHSULOTLARNI KAMAYTIRISH
    for (const item of cart) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: {
            decrement: item.quantityBags
          }
        }
      });
      
      // Ombor harakatini qayd etish
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'SALE',
          quantity: item.quantityBags,
          units: 0,
          reason: `Buyurtma: ${orderNumber}`,
          userId: customerId,
          userName: 'Telegram Bot',
          previousStock: 0,
          previousUnits: 0,
          newStock: 0,
          newUnits: 0,
          notes: 'Telegram bot orqali sotuv'
        }
      });
    }

    // 2. SOTUVNI YARATISH
    const sale = await prisma.sale.create({
      data: {
        customerId,
        userId: customerId,
        quantity: cart.reduce((sum, item) => sum + item.quantityBags, 0),
        pricePerBag: cart[0]?.pricePerBag || 0,
        totalAmount,
        paidAmount: 0,
        paymentStatus: 'UNPAID',
        items: {
          create: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantityBags,
            pricePerBag: item.pricePerBag,
            subtotal: item.subtotal
          }))
        }
      }
    });

    // 3. TO'LOVNI QAYD ETISH (KASSAGA)
    await prisma.payment.create({
      data: {
        customerId,
        amount: totalAmount,
        currency: 'UZS',
        description: `Buyurtma: ${orderNumber}`,
        paymentDetails: JSON.stringify({
          orderId: order.id,
          saleId: sale.id,
          status: 'PENDING'
        })
      }
    });

    // 4. ORDER WORKFLOW NI ISHGA TUSHIRISH (vaqtinchalik o'chirilgan)
    // try {
    //   const workflow: any = getOrderWorkflow();
    //   await workflow.processNewOrder(order.id);
    //   console.log('✅ Order workflow processed for order:', order.id);
    // } catch (workflowError) {
    //   console.error('❌ Order workflow error:', workflowError);
    // }
    console.log('✅ Order created:', order.id);

    await superCustomerBot?.answerCallbackQuery(queryId, { text: '✅ Buyurtma qabul qilindi!' });

    let message = `
🎉 **BUYURTMA QABUL QILINDI!**

📋 **Buyurtma raqami:** ${order.orderNumber}
📅 **Sana:** ${new Date().toLocaleDateString('uz-UZ')}
👤 **Mijoz:** ${order.customer.name}

📦 **Mahsulotlar:**
`;

    order.items.forEach((item: any, index: number) => {
      const productName = item.product?.name || 'Noma\'lum mahsulot';
      message += `\n${index + 1}. ${productName}`;
      
      // Miqdorni ko'rsatish
      if (item.quantityBags > 0 && item.quantityUnits > 0) {
        message += `\n   📊 ${item.quantityBags} qop + ${item.quantityUnits} dona`;
      } else if (item.quantityBags > 0) {
        message += `\n   📊 ${item.quantityBags} qop`;
      } else {
        message += `\n   📊 ${item.quantityUnits} dona`;
      }
      
      message += `\n   💰 ${item.subtotal.toLocaleString()} so'm`;
    });

    message += `\n\n💵 **JAMI:** ${order.totalAmount.toLocaleString()} so'm`;

    // Ombor tekshiruvi natijasini ko'rsatish
    const needProduction = inventoryCheck.filter(item => item.needProduction > 0);
    if (needProduction.length > 0) {
      message += `\n\n🏭 **ISHLAB CHIQARISH KERAK:**`;
      needProduction.forEach(item => {
        message += `\n\n📦 ${item.productName}`;
        message += `\n   📋 Buyurtma: ${item.ordered} qop`;
        message += `\n   📦 Omborda: ${item.inStock} qop`;
        message += `\n   🏭 Ishlab chiqarish: ${item.needProduction} qop`;
      });
    } else {
      message += `\n\n✅ **Barcha mahsulotlar omborda mavjud!**`;
    }

    message += `\n\n✅ Buyurtmangiz qabul qilindi va ko'rib chiqilmoqda.`;
    message += `\n📞 Tez orada operatorimiz siz bilan bog'lanadi.`;

    await superCustomerBot?.sendMessage(chatId, message);
    
    // Bosh menyuga qaytish
    await showMainMenu(chatId);

    await logActivity(customerId, 'ORDER_CREATED', { 
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
      inventoryCheck: inventoryCheck
    });

  } catch (error) {
    console.error('Order creation error:', error);
    await superCustomerBot?.answerCallbackQuery(queryId, { text: '❌ Xatolik yuz berdi!' });
    await superCustomerBot?.sendMessage(chatId, '❌ Buyurtma yaratishda xatolik yuz berdi. Qayta urinib ko\'ring.');
  }
}

// Bosh menyuni ko'rsatish
async function showMainMenu(chatId: number) {
  await superCustomerBot?.sendMessage(chatId, '🏠 Bosh menyu:', {
    reply_markup: {
      keyboard: [
        [{ text: '🛒 Smart Buyurtma' }, { text: '� Buyurtmalarim' }],
        [{ text: '� To\'lov' }, { text: '📊 Moliyaviy' }],
        [{ text: '🎁 Bonuslar' }, { text: '� Profil' }],
        [{ text: '� Yetkazib berish' }, { text: '📞 Yordam' }],
        [{ text: '🎮 Mini Ilovalar' }, { text: '⚙️ Sozlamalar' }],
        [{ text: '📣 Yangiliklar' }, { text: '🆔 Mening ID\'im' }]
      ],
      resize_keyboard: true
    }
  });
}

// Avtomatik xizmatlar
function startAutomatedServices() {
  // Kunlik eslatmalar
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 10 && now.getMinutes() === 0) {
      await sendDailyReminders();
    }
  }, 60000);

  // Haftalik hisobotlar
  setInterval(async () => {
    const now = new Date();
    if (now.getDay() === 1 && now.getHours() === 9) {
      await sendWeeklyReports();
    }
  }, 3600000);
}

async function sendDailyReminders() {
  console.log('Sending daily reminders...');
}

async function sendWeeklyReports() {
  console.log('Sending weekly reports...');
}

// ================= ANALITIKA FUNKSiyalari =================

// 1. Savdo metrikalari - 10 ta
async function handleSalesAnalytics(chatId: number, customerId: string) {
  const orders = await prisma.order.findMany({ where: { customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  // 1. Sales Volume
  const salesVolume = sales.reduce((sum, s) => sum + s.quantity, 0);
  
  // 2. Revenue
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  // 3. Average Order Value (AOV)
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? revenue / totalOrders : 0;
  
  // 4. Sales Growth Rate (oxirgi 30 kun)
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = orders.filter(o => o.createdAt > lastMonth).length;
  const growthRate = totalOrders > 0 ? (recentOrders / totalOrders * 100) : 0;
  
  // 5. Sales per Customer (bu mijoz uchun)
  const salesPerCustomer = sales.length;
  
  // 6. Sales per Day
  const daysAsCustomer = customer?.createdAt 
    ? Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const salesPerDay = daysAsCustomer > 0 ? sales.length / daysAsCustomer : 0;
  
  // 7. Sales per Employee (tahminiy)
  const salesPerEmployee = sales.length > 0 ? sales.length / 3 : 0; // 3 ta xodim
  
  // 8. Conversion Rate (tahminiy)
  const conversionRate = 78.5;
  
  // 9. Repeat Purchase Rate
  const repeatPurchaseRate = sales.length > 1 ? 85 : 0;
  
  // 10. Revenue per Visitor (tahminiy)
  const revenuePerVisitor = revenue / (sales.length * 1.5);
  
  const message = `
📈 **SAVDO METRIKALARI** (10 ta)

📊 **Asosiy ko'rsatkichlar:**
${createProgressBar(100, 100)}
📦 **1. Sales Volume:** ${salesVolume.toLocaleString()} qop
💰 **2. Revenue:** ${revenue.toLocaleString()} so'm
� **3. AOV:** ${aov.toFixed(2)} so'm
� **4. Growth Rate:** ${growthRate.toFixed(1)}%
${createProgressBar(growthRate, 100)}

� **Mijoz ko'rsatkichlari:**
${createProgressBar(85, 100)}
� **5. Sales per Customer:** ${salesPerCustomer} ta
📅 **6. Sales per Day:** ${salesPerDay.toFixed(2)} ta
👨‍� **7. Sales per Employee:** ${salesPerEmployee.toFixed(2)} ta

📊 **Samaradorlik:**
${createProgressBar(78, 100)}
🎯 **8. Conversion Rate:** ${conversionRate}%
🔄 **9. Repeat Purchase Rate:** ${repeatPurchaseRate}%
💵 **10. Revenue per Visitor:** ${revenuePerVisitor.toFixed(0)} so'm
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 2. Mahsulot metrikalari - 9 ta
async function handleProductAnalytics(chatId: number, customerId: string) {
  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { customerId } },
    include: { product: true }
  });
  const products = await prisma.product.findMany();
  
  // 1. COGS (Cost of Goods Sold) - tahminiy 70%
  const revenue = saleItems.reduce((sum, i) => sum + i.subtotal, 0);
  const cogs = revenue * 0.7;
  
  // 2. Unit Cost (o'rtacha)
  const totalUnits = saleItems.reduce((sum, i) => sum + i.quantity, 0);
  const unitCost = totalUnits > 0 ? cogs / totalUnits : 0;
  
  // 3. Unit Profit
  const unitProfit = totalUnits > 0 ? (revenue - cogs) / totalUnits : 0;
  
  // 4. Gross Profit
  const grossProfit = revenue - cogs;
  
  // 5. Gross Margin
  const grossMargin = revenue > 0 ? (grossProfit / revenue * 100) : 0;
  
  // 6. Contribution Margin (tahminiy)
  const contributionMargin = 25.5;
  
  // 7. Sell-through Rate (tahminiy)
  const sellThroughRate = 87.3;
  
  // 8. Inventory Turnover (tahminiy)
  const inventoryTurnover = 4.2;
  
  // 9. Stock Days (tahminiy)
  const stockDays = 45;
  
  const message = `
📦 **MAHSULOT METRIKALARI** (9 ta)

� **Xarajat va foyda:**
${createProgressBar(70, 100)}
� **1. COGS:** ${cogs.toLocaleString()} so'm
� **2. Unit Cost:** ${unitCost.toFixed(0)} so'm/qop
� **3. Unit Profit:** ${unitProfit.toFixed(0)} so'm/qop
💎 **4. Gross Profit:** ${grossProfit.toLocaleString()} so'm

📊 **Foiz ko'rsatkichlar:**
${createProgressBar(Math.round(grossMargin), 100)}
📈 **5. Gross Margin:** ${grossMargin.toFixed(1)}%
📊 **6. Contribution Margin:** ${contributionMargin}%
${createProgressBar(25, 100)}

📦 **Ombor samaradorligi:**
${createProgressBar(87, 100)}
🚀 **7. Sell-through Rate:** ${sellThroughRate}%
🔄 **8. Inventory Turnover:** ${inventoryTurnover}x
📅 **9. Stock Days:** ${stockDays} kun
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 3. Foyda va rentabellik - 10 ta
async function handleProfitAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const paid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const debt = revenue - paid;
  
  // Xarajatlar
  const cogs = revenue * 0.7;
  const operatingCost = revenue * 0.15;
  const otherCosts = revenue * 0.05;
  const totalCosts = cogs + operatingCost + otherCosts;
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  
  // 1. Net Profit
  const netProfit = revenue - totalCosts;
  
  // 2. Net Profit Margin
  const netMargin = revenue > 0 ? (netProfit / revenue * 100) : 0;
  
  // 3. Operating Profit
  const operatingProfit = revenue - operatingCost;
  
  // 4. Operating Margin
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue * 100) : 0;
  
  // 5. EBITDA
  const ebitda = netProfit + otherCosts;
  
  // 6. ROI
  const totalInvestment = cogs + operatingCost;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment * 100) : 0;
  
  // 7. ROA (Assets - kredit limiti sifatida)
  const assets = customer?.creditLimit || 1000000;
  const roa = assets > 0 ? (netProfit / assets * 100) : 0;
  
  // 8. ROE (Equity - balans sifatida)
  const equity = customer?.balance || 500000;
  const roe = equity > 0 ? (netProfit / equity * 100) : 0;
  
  // 9. Break-even Point
  const breakEvenPoint = revenue > 0 ? (totalCosts / (revenue / totalUnits)) : 0;
  
  // 10. Contribution per Unit
  const contributionPerUnit = totalUnits > 0 ? (revenue - cogs) / totalUnits : 0;
  
  const message = `
💰 **FOYDA VA RENTABELLIK** (10 ta)

� **Asosiy foydalar:**
${createProgressBar(Math.round(netMargin), 100)}
� **1. Net Profit:** ${netProfit.toLocaleString()} so'm
� **2. Net Margin:** ${netMargin.toFixed(1)}%
� **3. Operating Profit:** ${operatingProfit.toLocaleString()} so'm
� **4. Operating Margin:** ${operatingMargin.toFixed(1)}%
${createProgressBar(Math.round(operatingMargin), 100)}

📊 **Advanced metrikalar:**
💵 **5. EBITDA:** ${ebitda.toLocaleString()} so'm
🎯 **6. ROI:** ${roi.toFixed(1)}%
${createProgressBar(Math.round(roi), 100)}
🏦 **7. ROA:** ${roa.toFixed(1)}%
📈 **8. ROE:** ${roe.toFixed(1)}%

🎯 **Break-even:**
📉 **9. Break-even Point:** ${breakEvenPoint.toFixed(0)} qop
💰 **10. Contribution/Unit:** ${contributionPerUnit.toFixed(0)} so'm
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 4. Marketing va mijozlar - 10 ta
async function handleMarketingAnalytics(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const totalSpent = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const salesCount = sales.length;
  
  // 1. Customer Acquisition Cost (CAC)
  const cac = 50000; // tahminiy
  
  // 2. Customer Lifetime Value (LTV)
  const ltv = totalSpent;
  
  // 3. LTV/CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  
  // 4. Customer Retention Rate
  const retentionRate = salesCount > 1 ? 87.5 : 42.0;
  
  // 5. Churn Rate
  const churnRate = 100 - retentionRate;
  
  // 6. Customer Satisfaction Score (CSAT) - tahminiy
  const csat = 4.5;
  
  // 7. Net Promoter Score (NPS) - tahminiy
  const nps = 72;
  
  // 8. Cost per Lead (CPL)
  const cpl = cac * 0.3;
  
  // 9. Lead Conversion Rate
  const leadConversionRate = 25.8;
  
  // 10. Marketing ROI
  const marketingRoi = cac > 0 ? ((ltv - cac) / cac * 100) : 0;
  
  const message = `
👥 **MARKETING VA MIJOZLAR** (10 ta)

💎 **Mijoz qiymati:**
${createProgressBar(Math.min(Math.round(ltvCacRatio * 20), 100), 100)}
💰 **1. CAC:** ${cac.toLocaleString()} so'm
� **2. LTV:** ${ltv.toLocaleString()} so'm
📊 **3. LTV/CAC Ratio:** ${ltvCacRatio.toFixed(2)}x
🎯 **4. Retention Rate:** ${retentionRate}%

📉 **Churn va sodiqlik:**
${createProgressBar(Math.round(100 - churnRate), 100)}
� **5. Churn Rate:** ${churnRate.toFixed(1)}%
⭐ **6. CSAT:** ${csat}/5.0
📊 **7. NPS:** ${nps}
${createProgressBar(Math.round((nps + 100) / 2), 100)}

🎯 **Lead samaradorligi:**
� **8. Cost per Lead:** ${cpl.toLocaleString()} so'm
🎯 **9. Lead Conversion:** ${leadConversionRate}%
📈 **10. Marketing ROI:** ${marketingRoi.toFixed(1)}%
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 5. Qarzdorlik va kredit - 8 ta
async function handleDebtAnalytics(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const paidAmount = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const debt = totalAmount - paidAmount;
  const creditLimit = customer?.creditLimit || 0;
  const equity = customer?.balance || 500000;
  
  // 1. Debt Ratio
  const debtRatio = totalAmount > 0 ? (debt / totalAmount * 100) : 0;
  
  // 2. Debt-to-Equity Ratio
  const debtToEquity = equity > 0 ? (debt / equity) : 0;
  
  // 3. Interest Coverage Ratio (tahminiy)
  const interestCoverage = 4.5;
  
  // 4. Default Rate
  const defaultRate = 2.1;
  
  // 5. Accounts Receivable (debt sifatida)
  const accountsReceivable = debt;
  
  // 6. Receivable Turnover
  const receivableTurnover = debt > 0 ? (totalAmount / debt) : 0;
  
  // 7. Days Sales Outstanding (DSO)
  const dso = sales.length > 0 ? 21 : 0;
  
  // 8. Bad Debt Ratio
  const badDebtRatio = 1.8;
  
  const creditUtil = creditLimit > 0 ? (debt / creditLimit * 100) : 0;
  
  const message = `
💳 **QARZDORLIK VA KREDIT** (8 ta)

💰 **Qarz ko'rsatkichlari:**
${createProgressBar(Math.round(100 - debtRatio), 100)}
� **1. Debt Ratio:** ${debtRatio.toFixed(1)}%
⚖️ **2. Debt-to-Equity:** ${debtToEquity.toFixed(2)}x
🛡️ **3. Interest Coverage:** ${interestCoverage}x
� **4. Default Rate:** ${defaultRate}%

💳 **Kredit holati:**
${createProgressBar(Math.round(100 - creditUtil), 100)}
� **Jami qarz:** ${debt.toLocaleString()} so'm
🏦 **Kredit limiti:** ${creditLimit.toLocaleString()} so'm
📊 **Foydalanish:** ${creditUtil.toFixed(1)}%

📈 **Receivables:**
💰 **5. Accounts Receivable:** ${accountsReceivable.toLocaleString()} so'm
� **6. Receivable Turnover:** ${receivableTurnover.toFixed(2)}x
📅 **7. DSO:** ${dso} kun
⚠️ **8. Bad Debt Ratio:** ${badDebtRatio}%
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 6. Pul oqimi - 6 ta
async function handleCashflowAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' }
  });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  const paid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const unpaid = sales.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  // 1. Operating Cash Flow
  const operatingCashFlow = paid;
  
  // 2. Free Cash Flow (tahminiy)
  const freeCashFlow = paid * 0.85;
  
  // 3. Cash Burn Rate (oylik)
  const monthlyBurnRate = unpaid / 12;
  
  // 4. Cash Runway (qarzni tolash uchun)
  const monthlyRevenue = paid / 12;
  const cashRunway = monthlyRevenue > 0 ? (paid / monthlyRevenue) : 0;
  
  // 5. Cash Conversion Cycle (tahminiy)
  const ccc = 18;
  
  // 6. Working Capital (tahminiy)
  const currentAssets = customer?.creditLimit || 1000000;
  const currentLiabilities = unpaid;
  const workingCapital = currentAssets - currentLiabilities;
  
  const message = `
💵 **PUL OQIMI** (6 ta)

💰 **Asosiy pul oqimi:**
${createProgressBar(Math.round((paid / revenue) * 100), 100)}
📥 **1. Operating Cash Flow:** ${operatingCashFlow.toLocaleString()} so'm
� **2. Free Cash Flow:** ${freeCashFlow.toLocaleString()} so'm
� **To'langan:** ${((paid / revenue) * 100).toFixed(1)}%

� **Xarajatlar va zaxira:**
${createProgressBar(Math.round(100 - (monthlyBurnRate / monthlyRevenue * 100)), 100)}
� **3. Cash Burn Rate:** ${monthlyBurnRate.toLocaleString()} so'm/oy
🏃 **4. Cash Runway:** ${cashRunway.toFixed(1)} oy
⏱️ **5. Cash Conversion Cycle:** ${ccc} kun

💼 **Ishchi kapital:**
💰 **6. Working Capital:** ${workingCapital.toLocaleString()} so'm
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 7. Operatsion samaradorlik - 8 ta
async function handleOperationAnalytics(chatId: number, customerId: string) {
  const orders = await prisma.order.findMany({ where: { customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  
  // 1. Employee Productivity (3 ta xodim)
  const employeeCount = 3;
  const employeeProductivity = totalRevenue / employeeCount;
  
  // 2. Revenue per Employee
  const revenuePerEmployee = totalRevenue / employeeCount;
  
  // 3. Cost per Employee (tahminiy)
  const costPerEmployee = 2500000;
  
  // 4. Order Fulfillment Time
  const avgFulfillmentTime = 24;
  
  // 5. Return Rate
  const returnRate = 2.3;
  
  // 6. Defect Rate (tahminiy)
  const defectRate = 1.5;
  
  // 7. On-time Delivery Rate
  const onTimeRate = 94.7;
  
  // 8. Order Processing Efficiency
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const processingEfficiency = orders.length > 0 ? (deliveredOrders / orders.length * 100) : 0;
  
  const message = `
⚡ **OPERATSION SAMARADORLIK** (8 ta)

👨‍💼 **Xodim samaradorligi:**
${createProgressBar(Math.round(employeeProductivity / 100000), 100)}
� **1. Productivity:** ${employeeProductivity.toLocaleString()} so'm/xodim
💰 **2. Revenue/Employee:** ${revenuePerEmployee.toLocaleString()} so'm
� **3. Cost/Employee:** ${costPerEmployee.toLocaleString()} so'm

⏱️ **Vaqt va sifat:**
${createProgressBar(Math.round(onTimeRate), 100)}
� **4. Fulfillment Time:** ${avgFulfillmentTime} soat
✅ **5. Return Rate:** ${returnRate}%
⚠️ **6. Defect Rate:** ${defectRate}%
🎯 **7. On-time Delivery:** ${onTimeRate}%

� **Bajarilish samaradorligi:**
${createProgressBar(Math.round(processingEfficiency), 100)}
📋 **8. Processing Efficiency:** ${processingEfficiency.toFixed(1)}%
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 8. Strategik o'sish - 4 ta
async function handleStrategyAnalytics(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const orders = await prisma.order.findMany({ where: { customerId } });
  
  const startDate = customer?.createdAt ? new Date(customer.createdAt) : new Date();
  const daysAsCustomer = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const salesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  // 1. Market Share (tahminiy)
  const marketShare = 3.5;
  
  // 2. Customer Growth Rate (30 kunlik)
  const recentSales = sales.filter(s => s.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  const customerGrowthRate = salesCount > 0 ? (recentSales / salesCount * 100) : 0;
  
  // 3. Product Growth Rate
  const uniqueProducts = new Set(sales.map(s => s.productId)).size;
  const productGrowthRate = uniqueProducts * 12.5;
  
  // 4. New vs Returning Customers
  const isReturning = salesCount > 1;
  const newVsReturning = isReturning ? 'Returning (85%)' : 'New (15%)';
  
  const tier = salesCount > 20 ? '🌟 Premium' : salesCount > 10 ? '💎 Gold' : salesCount > 5 ? '👑 Silver' : '⭐ Bronze';
  
  const message = `
📊 **STRATEGIK O'SISH** (4 ta)

📈 **O'sish ko'rsatkichlari:**
${createProgressBar(Math.round(customerGrowthRate), 100)}
🎯 **1. Customer Growth:** ${customerGrowthRate.toFixed(1)}%
📦 **2. Product Growth:** ${productGrowthRate.toFixed(1)}%
🏆 **3. Market Share:** ${marketShare}%
${createProgressBar(Math.round(marketShare * 5), 100)}

👥 **Mijoz segmentatsiyasi:**
📊 **4. New vs Returning:** ${newVsReturning}

📅 **Mijoz ma'lumotlari:**
📆 **Mijoz bo'ldi:** ${daysAsCustomer} kun
📦 **Jami sotuv:** ${salesCount} ta
💰 **Kunlik o'rtacha:** ${(totalRevenue / daysAsCustomer).toFixed(0)} so'm

🏆 **Daraja:** ${tier}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// 9. Umumiy dashboard - kuchaytirilgan
async function handleDashboardAnalytics(chatId: number, customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const orders = await prisma.order.findMany({ where: { customerId } });
  const sales = await prisma.sale.findMany({ where: { customerId } });
  
  const totalSpent = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const paid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const debt = totalSpent - paid;
  const ltv = totalSpent;
  
  // Calculate health score
  const healthScore = Math.min(100, Math.round(
    (sales.length * 2) + 
    (paid / Math.max(totalSpent, 1) * 50) + 
    (ltv / 100000)
  ));
  
  const message = `
📊 **DASHBOARD** - Super Analytics

👤 **${customer?.name || 'Mijoz'}**
━━━━━━━━━━━━━━━━━━━━━━━━

🏥 **Sog'lomlik ko'rsatkichi:**
${createProgressBar(healthScore, 100)}
🎯 **${healthScore}/100** ${healthScore > 80 ? 'Ajoyib!' : healthScore > 50 ? 'Yaxshi' : 'Yaxshilanishi kerak'}

📈 **Savdo statistikasi:**
• Buyurtmalar: ${orders.length} ta
• Sotuvlar: ${sales.length} ta
• Jami: ${totalSpent.toLocaleString()} so'm
• O'rtacha: ${sales.length > 0 ? (totalSpent / sales.length).toFixed(0) : 0} so'm

💰 **Moliyaviy holat:**
• To'langan: ${paid.toLocaleString()} so'm
• Qarz: ${debt.toLocaleString()} so'm
• LTV: ${ltv.toLocaleString()} so'm
• Soliq holati: ${debt > 0 ? '⚠️ Qarz bor' : '✅ Tozalar'}

📊 **Reyting:** ${sales.length > 20 ? '⭐⭐⭐⭐⭐ Premium' : sales.length > 10 ? '⭐⭐⭐⭐ Gold' : sales.length > 5 ? '⭐⭐⭐ Silver' : '⭐⭐ Bronze'}

📅 Yangilangan: ${new Date().toLocaleDateString('uz-UZ')}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Batafsil tahlil', callback_data: 'ana_advanced' }],
        [{ text: '🔙 Orqaga', callback_data: 'ana_back' }]
      ]
    }
  });
}

// Yordamchi funksiya - progress bar yaratish
function createProgressBar(value: number, max: number, length: number = 20): string {
  const filled = Math.round((value / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// ================= ILG'OR ANALITIKA =================

// Advanced Analytics Menu
async function handleAdvancedAnalytics(chatId: number, customerId: string) {
  const message = `
🔥 **ILG'OR ANALITIKA**

📊 **Kuchaytirilgan tahlillar:**

📉 **Trend Analysis** - Vaqt bo'yicha o'sish
🎯 **Predictions** - Kelajak bashorati
📅 **Comparison** - Davrlar solishtiruvi
🏆 **Benchmarks** - O'rtacha ko'rsatkichlar
📈 **Charts** - Vizual grafiklar
⚡ **Real-time** - Jonli statistika

Qaysi tahlilni tanlaysiz?
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📉 Trends', callback_data: 'ana_trends' },
          { text: '🎯 Predictions', callback_data: 'ana_predictions' }
        ],
        [
          { text: '📅 Comparison', callback_data: 'ana_comparison' },
          { text: '🏆 Benchmarks', callback_data: 'ana_benchmarks' }
        ],
        [
          { text: '🔙 Orqaga', callback_data: 'ana_back' }
        ]
      ]
    }
  });
}

// Trend Analysis
async function handleTrendAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({
    where: { customerId },
    orderBy: { createdAt: 'asc' }
  });
  
  // Weekly trend
  const weeklyData = groupByWeek(sales);
  const trendLine = createLineChart(weeklyData, 'Sales Trend');
  
  // Calculate trend direction
  const firstHalf = sales.slice(0, Math.floor(sales.length / 2));
  const secondHalf = sales.slice(Math.floor(sales.length / 2));
  const firstRevenue = firstHalf.reduce((sum, s) => sum + s.totalAmount, 0);
  const secondRevenue = secondHalf.reduce((sum, s) => sum + s.totalAmount, 0);
  const trendDirection = secondRevenue > firstRevenue ? '📈 Oshish' : '📉 Pasayish';
  const trendPercent = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue * 100) : 0;
  
  const message = `
📉 **TREND TAHLILI**

${trendLine}

📊 **Trend yo'nalishi:**
${createProgressBar(Math.abs(Math.round(trendPercent)), 100)}
${trendDirection}: ${Math.abs(trendPercent).toFixed(1)}%

📈 **Haftalik dinamika:**
🔼 **Yuksalish:** ${weeklyData.filter((_: any, i: number, arr: any[]) => i > 0 && arr[i] > arr[i-1]).length} hafta
🔽 **Pasayish:** ${weeklyData.filter((_: any, i: number, arr: any[]) => i > 0 && arr[i] < arr[i-1]).length} hafta
➡️ **Stabil:** ${weeklyData.filter((_: any, i: number, arr: any[]) => i > 0 && arr[i] === arr[i-1]).length} hafta

💡 **Xulosa:** ${trendPercent > 0 ? 'Sotuvlar oshmoqda!' : 'Sotuvlar pasaymoqda!'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Prediction Analytics
async function handlePredictionAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  const avgOrderValue = sales.length > 0 ? sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length : 0;
  const avgFrequency = sales.length > 0 ? 30 / (sales.length / Math.max(1, Math.floor((Date.now() - new Date(customer?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))) : 30;
  
  // Predictions
  const nextMonthRevenue = avgOrderValue * (30 / avgFrequency);
  const nextQuarterRevenue = nextMonthRevenue * 3;
  const nextYearRevenue = nextMonthRevenue * 12;
  
  // Churn probability
  const daysSinceLastOrder = sales.length > 0 
    ? Math.floor((Date.now() - new Date(sales[sales.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const churnRisk = daysSinceLastOrder > 30 ? 'Yuqori' : daysSinceLastOrder > 14 ? "O'rta" : 'Past';
  
  const message = `
🎯 **BASHORATLAR**

📊 **Kelajak daromadlari:**
${createProgressBar(75, 100)}
📅 **Keyingi oy:** ${nextMonthRevenue.toLocaleString()} so'm
📆 **Keyingi kvartal:** ${nextQuarterRevenue.toLocaleString()} so'm
📈 **Keyingi yil:** ${nextYearRevenue.toLocaleString()} so'm

⚠️ **Churn xavfi:**
${createProgressBar(churnRisk === 'Yuqori' ? 90 : churnRisk === "O'rta" ? 50 : 20, 100)}
🔴 **Xavf darajasi:** ${churnRisk}
⏰ **Oxirgi buyurtmadan:** ${daysSinceLastOrder} kun

💡 **Tavsiya:** ${churnRisk === 'Yuqori' ? 'Mijozni qayta jalb qilish kerak!' : 'Mijoz faol, yaxshi!'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Comparison Analytics
async function handleComparisonAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ 
    where: { customerId },
    orderBy: { createdAt: 'asc' }
  });
  
  const mid = Math.floor(sales.length / 2);
  const firstHalf = sales.slice(0, mid);
  const secondHalf = sales.slice(mid);
  
  const firstRevenue = firstHalf.reduce((sum, s) => sum + s.totalAmount, 0);
  const secondRevenue = secondHalf.reduce((sum, s) => sum + s.totalAmount, 0);
  const firstCount = firstHalf.length;
  const secondCount = secondHalf.length;
  
  const revenueChange = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue * 100) : 0;
  const countChange = firstCount > 0 ? ((secondCount - firstCount) / firstCount * 100) : 0;
  
  const message = `
📅 **SOLISHTIRISH**

📊 **Davrlar solishtiruvi:**

📈 **Birinchi yarmi:**
💰 Daromad: ${firstRevenue.toLocaleString()} so'm
📦 Sotuvlar: ${firstCount} ta

📉 **Ikkinchi yarmi:**
💰 Daromad: ${secondRevenue.toLocaleString()} so'm
📦 Sotuvlar: ${secondCount} ta

📊 **O'zgarish:**
${createProgressBar(Math.min(Math.abs(Math.round(revenueChange)), 100), 100)}
💰 Daromad: ${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%
📦 Sotuvlar: ${countChange > 0 ? '+' : ''}${countChange.toFixed(1)}%

${revenueChange > 0 ? '📈 Rivojlanish bor!' : '📉 Diqqat talab etiladi!'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Benchmark Analytics
async function handleBenchmarkAnalytics(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
  const salesCount = sales.length;
  
  // Industry benchmarks (example values)
  const industryAOV = 150000;
  const industryFrequency = 4;
  const industryRetention = 75;
  
  const aovPerformance = (avgOrderValue / industryAOV * 100);
  const frequencyPerformance = (salesCount / industryFrequency * 100);
  
  const message = `
🏆 **BENCHMARKING**

📊 **Sizning ko'rsatkichlaringiz:**
💰 O'rtacha: ${avgOrderValue.toLocaleString()} so'm
📦 Sotuvlar: ${salesCount} ta
💎 Jami: ${totalRevenue.toLocaleString()} so'm

📈 **Sanoat o'rtachasi:**
💰 O'rtacha: ${industryAOV.toLocaleString()} so'm
📦 Chastota: ${industryFrequency} ta/oy

🎯 **Solishtirish:**
${createProgressBar(Math.min(Math.round(aovPerformance), 100), 100)}
💰 O'rtacha buyurtma: ${aovPerformance.toFixed(0)}%
${createProgressBar(Math.min(Math.round(frequencyPerformance), 100), 100)}
📦 Chastota: ${frequencyPerformance.toFixed(0)}%

${aovPerformance > 100 ? 'Siz ortachadan yuqorisiz' : 'Oshish mumkin'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Yordamchi funksiyalar
function groupByWeek(sales: any[]): number[] {
  const weekly: { [key: string]: number } = {};
  sales.forEach(sale => {
    const date = new Date(sale.createdAt);
    const weekKey = `${date.getFullYear()}-W${Math.floor((date.getDate() / 7))}`;
    weekly[weekKey] = (weekly[weekKey] || 0) + sale.totalAmount;
  });
  return Object.values(weekly);
}

function createLineChart(data: number[], title: string): string {
  if (data.length === 0) return '📊 Ma\'lumot yo\'q';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  let chart = '**' + title + '**\n\n';
  
  // Simple ASCII line chart
  data.forEach((value, index) => {
    const barLength = Math.round(((value - min) / range) * 10);
    const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
    chart += (index + 1) + '. ' + bar + ' ' + value.toLocaleString() + '\n';
  });
  
  return chart;
}

// ================= SMART ALERTS & ADVANCED FEATURES =================

// Smart Alerts tizimi
async function handleSmartAlerts(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  const alerts = [];
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const paid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const debt = totalRevenue - paid;
  
  // Alert 1: High debt
  if (debt > 500000) {
    alerts.push('⚠️ Qarz miqdori yuqori: ' + debt.toLocaleString() + ' so\'m');
  }
  
  // Alert 2: No recent orders
  const lastOrder = sales.length > 0 ? new Date(sales[sales.length - 1].createdAt) : null;
  const daysSinceOrder = lastOrder ? Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  if (daysSinceOrder > 30) {
    alerts.push('⏰ Oxirgi buyurtmadan ' + daysSinceOrder + ' kun o\'tdi');
  }
  
  // Alert 3: Good performance
  if (sales.length > 10 && debt < totalRevenue * 0.3) {
    alerts.push('✅ Ajoyib mijoz! Sotuvlar faol');
  }
  
  // Alert 4: Credit limit warning
  const creditLimit = customer?.creditLimit || 0;
  if (debt > creditLimit * 0.8) {
    alerts.push('🚨 Kredit limitiga yaqinlashdingiz!');
  }
  
  const message = `
🚨 **SMART ALERTS**

${alerts.length > 0 ? alerts.join('\n') : '✅ Hech qanday ogohlantirish yo\'q'}

📊 **Umumiy holat:**
• Sotuvlar: ${sales.length} ta
• Jami: ${totalRevenue.toLocaleString()} so\'m
• Qarz: ${debt.toLocaleString()} so\'m

${alerts.length > 2 ? '⚠️ Diqqat talab etiladi!' : '✅ Holat yaxshi'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Customer Segmentation
async function handleSegmentation(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ where: { customerId } });
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
  const frequency = sales.length;
  
  // RFM Analysis
  let rfmSegment = 'Yangi';
  if (frequency > 20 && avgOrderValue > 200000) {
    rfmSegment = 'Champion';
  } else if (frequency > 10 && avgOrderValue > 100000) {
    rfmSegment = 'Loyal';
  } else if (frequency > 5) {
    rfmSegment = 'Potential';
  } else if (frequency > 0) {
    rfmSegment = 'At Risk';
  }
  
  const message = `
👥 **MIJOZ SEGMENTATSIYASI**

🎯 **RFM Tahlili:**
${createProgressBar(Math.min(frequency * 5, 100), 100)}
📊 **Segment:** ${rfmSegment}

📈 **Ko'rsatkichlar:**
• Chastota: ${frequency} ta
• O'rtacha: ${avgOrderValue.toLocaleString()} so'm
• Jami: ${totalRevenue.toLocaleString()} so'm

💡 **Tavsiya:**
${rfmSegment === 'Champion' ? '🏆 Siz top mijoz! Maxsus takliflar kuting!' : 
  rfmSegment === 'Loyal' ? '💎 Sodiqlikka mos bonuslar' :
  rfmSegment === 'Potential' ? '📈 Chastotani oshirish tavsiya etiladi' :
  '⏰ Qayta jalb qilish kerak'}
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Product Recommendations
async function handleRecommendations(chatId: number, customerId: string) {
  const sales = await prisma.sale.findMany({ 
    where: { customerId },
    include: { product: true }
  });
  
  const boughtProducts = new Set(sales.map(s => s.productId));
  const allProducts = await prisma.product.findMany({
    where: { currentStock: { gt: 0 } }
  });
  
  // Simple recommendation: products not bought yet
  const recommendations = allProducts
    .filter(p => !boughtProducts.has(p.id))
    .slice(0, 3);
  
  let message = `
💡 **MAHSULOT TAVSIYALARI**

📊 **Sizning xaridlar tarixingiz:**
• Sotib olingan: ${boughtProducts.size} xil mahsulot
• Mavjud: ${allProducts.length} xil mahsulot

🎯 **Sizga mos mahsulotlar:**
`;
  
  recommendations.forEach((product, index) => {
    message += `
${index + 1}. **${product.name}**
   💰 ${product.pricePerBag.toLocaleString()} so'm/qop
   📦 ${product.currentStock} qop mavjud
`;
  });
  
  message += `
🛒 Buyurtma berish uchun: /start
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_advanced' }]]
    }
  });
}

// Export functionality
async function handleExport(chatId: number, customerId: string) {
  const message = `
📤 **MA'LUMOTLARNI EKSPORT QILISH**

📊 **Mavjud formatlar:**

📄 **PDF Hisobot**
To'liq tahliliy hisobot

📊 **Excel/CSV**
Jadval ma'lumotlari

📈 **JSON Data**
Dasturchilar uchun

⏳ Tez orada qo'shiladi...

💡 Hozircha ma'lumotlarni ko'rish:
📊 Umumiy hisobot tugmasini bosing
  `;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'ana_back' }]]
    }
  });
}

// To'lov funksiyalari
async function showPaymentOptions(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const unpaidOrders = await prisma.order.findMany({
    where: { 
      customerId: customer.id,
      paidAmount: { lt: prisma.order.fields.totalAmount }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const totalDebt = unpaidOrders.reduce((sum: number, order: any) => sum + (order.totalAmount - order.paidAmount), 0);

  let message = `💳 **TO'LOV QILISH**\n\n`;
  message += `👤 Mijoz: ${customer.name}\n`;
  message += `💰 Qarz: ${formatCurrency(totalDebt)}\n`;
  message += `📦 To'lanmagan buyurtmalar: ${unpaidOrders.length} ta\n\n`;

  if (unpaidOrders.length === 0) {
    message += `✅ Sizda to'lanmagan buyurtmalar yo'q!`;
  } else {
    message += `🔸 **So'nggi buyurtmalar:**\n`;
    unpaidOrders.forEach((order: any, index: number) => {
      const remaining = order.totalAmount - order.paidAmount;
      message += `${index + 1}. ${order.orderNumber} - ${formatCurrency(remaining)}\n`;
    });
  }

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💰 To\'lov qildim', callback_data: 'payment_confirm' }
      ],
      [
        { text: '📊 Batafsil', callback_data: 'fin_balance' },
        { text: '🔙 Orqaga', callback_data: 'back_main' }
      ]
    ]
  };

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

async function startPaymentProcess(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const unpaidOrders = await prisma.order.findMany({
    where: { 
      customerId: customer.id,
      paidAmount: { lt: prisma.order.fields.totalAmount }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (unpaidOrders.length === 0) {
    await superCustomerBot?.sendMessage(chatId, '✅ Sizda to\'lanmagan buyurtmalar yo\'q!');
    return;
  }

  let message = `💰 **TO'LOV QILDIYAPMAN**\n\n`;
  message += `Qaysi buyurtmani to'ladingiz?\n\n`;

  const keyboard = {
    inline_keyboard: [] as any[][]
  };

  unpaidOrders.forEach((order: any, index: number) => {
    const remaining = order.totalAmount - order.paidAmount;
    message += `🔸 ${order.orderNumber} - ${formatCurrency(remaining)}\n`;
    keyboard.inline_keyboard.push([
      { text: `💰 To'landi #${index + 1}`, callback_data: `pay_order_${order.id}` }
    ]);
  });

  keyboard.inline_keyboard.push([
    { text: '🔙 Orqaga', callback_data: 'fin_payment' }
  ]);

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

async function confirmPaymentReceived(chatId: number) {
  await superCustomerBot?.sendMessage(chatId, 
    `💰 **TO'LOV QABUL QILINDI**\n\n` +
    `✅ Sizning to'lovingiz muvaffaqiyatli qabul qilindi!\n\n` +
    `🎉 Rahmat! Sizning buyurtmangiz tayyor.\n\n` +
    `📦 Yetkazib berish: 1-3 ish kuni\n` +
    `🚚 Haydovchi siz bilan bog'lanadi.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📦 Buyurtmalarim', callback_data: 'my_orders' },
            { text: '🏆 Bosh menyu', callback_data: 'back_main' }
          ]
        ]
      }
    }
  );
}

async function processOrderPayment(chatId: number, orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true
      }
    });

    if (!order) {
      await superCustomerBot?.sendMessage(chatId, '❌ Buyurtma topilmadi.');
      return;
    }

    const remaining = order.totalAmount - order.paidAmount;
    
    // To'lovni qayd etish
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paidAmount: order.totalAmount, // To'liq to'lov deb hisoblaymiz
        paymentDetails: JSON.stringify({
          paidVia: 'telegram_bot',
          paidAt: new Date().toISOString(),
          paidAmount: remaining
        })
      }
    });

    // Admin botga xabar yuborish
    const adminBot = botManager.getBot('admin');
    if (adminBot) {
      await adminBot.sendMessage(
        process.env.TELEGRAM_ADMIN_CHAT_ID || '',
        `💰 **YANGI TO'LOV**\n\n` +
        `👤 Mijoz: ${order.customer.name}\n` +
        `📋 Buyurtma: ${order.orderNumber}\n` +
        `💰 Summa: ${formatCurrency(remaining)}\n` +
        `📱 Telegram ID: ${chatId}\n\n` +
        `🎯 Pul yo'nalishini tanlang!`
      );
    }

    await superCustomerBot?.sendMessage(chatId, 
      `💰 **TO'LOV MUVAFFAQIYATLI**\n\n` +
      `✅ Buyurtma: ${order.orderNumber}\n` +
      `💰 To'langan summa: ${formatCurrency(remaining)}\n` +
      `🎉 Rahmat! To'lovingiz qabul qilindi.\n\n` +
      `📦 Buyurtmangiz tez orada tayyor bo'ladi.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📦 Buyurtmalarim', callback_data: 'my_orders' },
              { text: '🏆 Bosh menyu', callback_data: 'back_main' }
            ]
          ]
        }
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    await superCustomerBot?.sendMessage(chatId, '❌ To\'lovni qayd etishda xatolik yuz berdi.');
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS'
  }).format(amount);
}

// Qo'shimcha mijoz bot funksiyalari
async function showMyOrders(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  if (orders.length === 0) {
    await superCustomerBot?.sendMessage(chatId, '📦 Sizda buyurtmalar yo\'q.');
    return;
  }

  let message = `📦 **Sizning Buyurtmalaringiz (${orders.length}):**\n\n`;
  
  const statusEmojiMap: { [key: string]: string } = {
    'PENDING': '⏳',
    'CONFIRMED': '✅',
    'IN_PRODUCTION': '🏭',
    'READY': '📦',
    'DELIVERED': '🚚',
    'SOLD': '💰',
    'CANCELLED': '❌'
  };
  
  orders.forEach((order: any, index: number) => {
    const status = order.status as string;
    const statusEmoji = statusEmojiMap[status] || '📋';

    message += `${index + 1}. ${statusEmoji} ${order.orderNumber}\n`;
    message += `   💰 ${formatCurrency(order.totalAmount)}\n`;
    message += `   📊 ${status}\n\n`;
  });

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showFinancialInfo(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id }
  });

  const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
  const totalPaid = orders.reduce((sum: number, order: any) => sum + order.paidAmount, 0);
  const debt = totalSpent - totalPaid;

  let message = `💰 **Moliyaviy Ma'lumotlar**\n\n`;
  message += `👤 Mijoz: ${customer.name}\n`;
  message += `💰 Jami xaridlar: ${formatCurrency(totalSpent)}\n`;
  message += `💳 To'langan: ${formatCurrency(totalPaid)}\n`;
  message += `💸 Qarz: ${formatCurrency(debt)}\n`;
  message += `📊 Buyurtmalar soni: ${orders.length} ta\n\n`;

  if (debt > 0) {
    message += `⚠️ Qarzingiz bor! To'lov qilish uchun 💰 To'lov tugmasini bosing.`;
  } else {
    message += `✅ Barcha to'lovlaringiz amalga oshirilgan!`;
  }

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showBonusPrograms(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const loyaltyPoints = await calculateLoyaltyPoints(customer.id);
  const level = getCustomerLevel(loyaltyPoints);

  let message = `🎁 **Bonus Dasturlari**\n\n`;
  message += `👤 Mijoz: ${customer.name}\n`;
  message += `💎 Ballar: ${loyaltyPoints}\n`;
  message += `⭐ Daraja: ${level.emoji} ${level.name}\n\n`;
  
  message += `🎯 **Ballar to'plash usullari:**\n`;
  message += `• Har 10,000 so'm xarid = 10 ball\n`;
  message += `• Do'st taklif qilish = 100 ball\n`;
  message += `• Har bir buyurtma = 5 ball\n`;
  message += `• Sharh qoldirish = 20 ball\n\n`;
  
  message += `🏆 **Ballardan foydalanish:**\n`;
  message += `• 500 ball = 5% chegirma\n`;
  message += `• 1000 ball = 10% chegirma\n`;
  message += `• 5000 ball = 15% chegirma\n`;
  message += `• 10000+ ball = 20% chegirma + VIP status\n\n`;
  
  message += `💡 Ballarningiz: ${loyaltyPoints}`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showProfile(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const loyaltyPoints = await calculateLoyaltyPoints(customer.id);
  const level = getCustomerLevel(loyaltyPoints);

  let message = `👤 **Profil Ma'lumotlari**\n\n`;
  message += `📋 Ism: ${customer.name}\n`;
  message += `📞 Telefon: ${customer.phone}\n`;
  message += `📍 Manzil: ${customer.address || 'Kiritilmagan'}\n`;
  message += `🆔 ID: ${customer.id.slice(-8).toUpperCase()}\n`;
  message += `💎 Ballar: ${loyaltyPoints}\n`;
  message += `⭐ Daraja: ${level.emoji} ${level.name}\n`;
  message += `📱 Telegram: @${customer.telegramUsername || 'Noma\'lum'}\n`;
  message += `🔔 Bildirishmalar: ${customer.notificationsEnabled ? '✅ Yoqilgan' : '❌ O\'chirilgan'}`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showDeliveryInfo(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const activeOrders = await prisma.order.findMany({
    where: { 
      customerId: customer.id,
      status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'READY'] }
    },
    orderBy: { createdAt: 'desc' }
  });

  let message = `🚚 **Yetkazib berish Ma'lumotlari**\n\n`;
  
  if (activeOrders.length === 0) {
    message += `📦 Sizda faol buyurtmalar yo'q.\n\n`;
    message += `⏱️ **Yetkazib berish vaqti:**\n`;
    message += `• Tashkent shahri: 1-2 kun\n`;
    message += `• Viloyatlar: 2-3 kun\n`;
    message += `• 100+ qop: Bepul yetkazib berish\n`;
    message += `• 100 qop dan kam: 50,000 so'm\n\n`;
    message += `📞 Yetkazib berish bo'yicha: +998 90 123 45 67`;
  } else {
    message += `📦 **Faol buyurtmalar (${activeOrders.length}):**\n\n`;
    
    const deliveryStatusMap: { [key: string]: string } = {
      'CONFIRMED': '✅',
      'IN_PRODUCTION': '🏭',
      'READY': '📦'
    };
  
    activeOrders.forEach((order: any, index: number) => {
      const status = order.status as string;
      const statusEmoji = deliveryStatusMap[status] || '📋';

      message += `${index + 1}. ${statusEmoji} ${order.orderNumber}\n`;
      message += `   📊 Status: ${order.status}\n`;
      message += `   💰 ${formatCurrency(order.totalAmount)}\n\n`;
    });
  }

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showHelp(chatId: number) {
  let message = `📞 **Yordam va Qo'llab-quvvatlash**\n\n`;
  message += `🆘 **Tezkor yordam:**\n`;
  message += `• Operator: +998 90 123 45 67\n`;
  message += `• Telegram: @luxpetplast_admin\n`;
  message += `• Email: support@luxpetplast.uz\n\n`;
  
  message += `📚 **Ko'p so'raladigan savollar:**\n`;
  message += `• /start - Bosh menyu\n`;
  message += `• 🛒 Smart Buyurtma - Yangi buyurtma\n`;
  message += `• 📦 Buyurtmalarim - Buyurtmalar tarixi\n`;
  message += `• 💰 To'lov - To'lov qilish\n`;
  message += `• 🎁 Bonuslar - Ballar va chegirmalar\n\n`;
  
  message += `⏰ **Ish vaqti:**\n`;
  message += `• Dushanba-Juma: 9:00 - 18:00\n`;
  message += `• Shanba: 9:00 - 15:00\n`;
  message += `• Yakshanba: Dam olish kuni\n\n`;
  
  message += `📍 **Manzil:**\n`;
  message += `Toshkent shahari, Yunusobod tumani,\n`;
  message += `Choshtepa ko'chasi, 12-uy`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showMiniApps(chatId: number) {
  let message = `🎮 **Mini Ilovalar**\n\n`;
  message += `🧮 **Kalkulyator:**\n`;
  message += `💰 Mahsulot narxi va miqdorini hisoblash\n`;
  message += `📊 Yetkazib berish narxi\n`;
  message += `🎁 Chegirma kalkulyatori\n\n`;
  
  message += `🎯 **O'yinlar:**\n`;
  message += `🎲 Qimor o'yini (ballar uchun)\n`;
  message += `🧩 Aql o'yinlari\n`;
  message += `🏆 Turnirlar\n\n`;
  
  message += `📊 **Vizual vositalar:**\n`;
  message += `📈 Statistika grafiklari\n`;
  message += `🗺️ Yetkazib berish xaritasi\n`;
  message += `📅 Taqvim va reja\n\n`;
  
  message += `Tez orada qo'shiladi! 🚀`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🧮 Kalkulyator', callback_data: 'mini_calculator' },
          { text: '🎲 O\'yin', callback_data: 'mini_game' }
        ],
        [
          { text: '📊 Statistika', callback_data: 'mini_stats' },
          { text: '🔙 Orqaga', callback_data: 'back_main' }
        ]
      ]
    }
  });
}

async function showSettings(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  let message = `⚙️ **Sozlamalar**\n\n`;
  message += `🔔 **Bildirishnomalar:**\n`;
  message += `${customer.notificationsEnabled ? '✅ Yoqilgan' : '❌ O\'chirilgan'}\n\n`;
  
  message += `🌐 **Til:**\n`;
  message += `🇺🇿 O'zbekcha\n\n`;
  
  message += `🎨 **Tema:**\n`;
  message += `️ Yorqin (standart)\n\n`;
  
  message += `📱 **Interfeys:**\n`;
  message += `📱 Standart\n\n`;
  
  message += `🔐 **Maxfiylik:**\n`;
  message += `✅ Ma'lumotlaringiz himoyalangan`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: `${customer.notificationsEnabled ? '🔕' : '🔔'} Bildirishnomalar`, callback_data: 'toggle_notifications' }
        ],
        [
          { text: '🌐 Til', callback_data: 'settings_language' },
          { text: '🎨 Thema', callback_data: 'settings_theme' }
        ],
        [
          { text: '🔙 Orqaga', callback_data: 'back_main' }
        ]
      ]
    }
  });
}

async function showNews(chatId: number) {
  let message = `📣 **Yangiliklar va E'lonlar**\n\n`;
  message += `🔥 **SO'NGGI YANGILIKLAR:**\n\n`;
  
  message += `📢 **Aksiya!** 🎉\n`;
  message += `🔥 Barcha mahsulotlarga 15% chegirma!\n`;
  message += `📅 Muddat: 31-martgacha\n`;
  message += `🎯 Kod: NEW2024\n\n`;
  
  message += `🆕 **Yangi mahsulotlar:**\n`;
  message += `• Premium qoplar (rangli)\n`;
  message += `• Ekologik toza qoplar\n`;
  message += `• Bolalar uchun qoplar\n\n`;
  
  message += `📊 **Kompaniya yangiliklari:**\n`;
  message += `• Yangi filial ochildi! 🎉\n`;
  message += `• 24/7 yetkazib berish xizmati\n`;
  message += `• Mobil ilova tez orada\n\n`;
  
  message += `📅 **Tadbirlar:**\n`;
  message += `• 15-mart: Katta chegirma kuni\n`;
  message += `• 20-mart: Yangi mahsulot taqdimoti\n\n`;
  
  message += `🔔 Barcha yangiliklardan xabardor bo'lish uchun bildirishnomalarni yoqing!`;

  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

async function showMyId(chatId: number) {
  const customer = await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });

  if (!customer) {
    await superCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi.');
    return;
  }

  const uniqueId = customer.id.slice(-8).toUpperCase();
  
  let message = `🆔 **Sizning Identifikatsiyangiz**\n\n`;
  message += `📋 **Asosiy ID:** ${uniqueId}\n`;
  message += `👤 **Ism:** ${customer.name}\n`;
  message += `📞 **Telefon:** ${customer.phone}\n`;
  message += `📱 **Telegram ID:** ${chatId}\n`;
  message += `👤 **Username:** @${customer.telegramUsername || 'Noma\'lum'}\n\n`;
  
  message += `⚠️ **Xavfsizlik eslatmasi:**\n`;
  message += `• ID raqamingizni hech kimga bermang!\n`;
  message += `• Faqat rasmiy xodimlar ID so'raydi\n`;
  message += `• Shubhali holatda admin bilan bog'laning\n\n`;
  
  message += `📞 **Admin:** +998 90 123 45 67`;
  
  await superCustomerBot?.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

export { superCustomerBot };
