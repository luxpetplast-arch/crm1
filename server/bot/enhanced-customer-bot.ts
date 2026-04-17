import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../utils/prisma';

let enhancedCustomerBot: TelegramBot | null = null;

// Mijozlar uchun yaxshilangan bot
export function initEnhancedCustomerBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ Enhanced Customer bot token not found');
    return null;
  }

  try {
    enhancedCustomerBot = new TelegramBot(token, { polling: true });
    setupEnhancedCustomerCommands();
    startDailyReminders();
    console.log('🤖 Enhanced Customer Bot ishga tushdi!');
    return enhancedCustomerBot;
  } catch (error) {
    console.error('Enhanced Customer Bot xatolik:', error);
    return null;
  }
}

function setupEnhancedCustomerCommands() {
  if (!enhancedCustomerBot) return;

  // Start komandasi
  enhancedCustomerBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const customer = await findOrCreateCustomer(chatId, msg.from);
    
    // Unique ID yaratish (customer ID ning oxirgi 8 belgisi)
    const uniqueId = customer.id.slice(-8).toUpperCase();
    
    const welcomeMessage = `
🎉 **Xush kelibsiz, ${customer.name}!**

🛍️ **PREMIUM MIJOZ BOTI**

🆔 **Sizning ID raqamingiz:** \`${uniqueId}\`
📋 **Bu ID ni saqlang!** Saytda ro'yxatdan o'tishda kerak bo'ladi.

Bu bot orqali siz:
🛒 Tezkor buyurtma berishingiz
💰 Real-time balans kuzatishingiz  
📊 Batafsil sotuvlar tarixini ko'rishingiz
🎁 Maxsus chegirmalardan foydalanishingiz
📞 24/7 yordam olishingiz mumkin

📱 **Tezkor tugmalar:**
    `;

    await enhancedCustomerBot?.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '🛒 Tezkor buyurtma' }, { text: '💰 Mening balansim' }],
          [{ text: '📊 Sotuvlar tarixi' }, { text: '🎁 Chegirmalar' }],
          [{ text: '👤 Profil' }, { text: '📞 Yordam' }],
          [{ text: '📋 Katalog' }, { text: '🔔 Bildirishnomalar' }],
          [{ text: '🆔 Mening ID\'im' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });

    // Mijoz faolligini yozib olish
    await logCustomerActivity(customer.id, 'BOT_START');
  });

  // Komandalar
  enhancedCustomerBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      // Mijozni topish yoki yaratish
      const customer = await findOrCreateCustomer(chatId, msg.from);

      // MUHIM: Agar oddiy xabar bo'lsa (komanda emas), uni database'ga saqlash
      // Bu xabar saytda ko'rinadi
      if (text && !text.startsWith('/')) {
        const isCommand = ['🛒 Tezkor buyurtma', '💰 Mening balansim', '📊 Sotuvlar tarixi', 
                          '🎁 Chegirmalar', '👤 Profil', '📞 Yordam', '📋 Katalog', 
                          '🔔 Bildirishnomalar'].includes(text);
        
        if (!isCommand) {
          // Xabarni database'ga saqlash - SAYTDA KO'RINADI
          await prisma.customerChat.create({
            data: {
              customerId: customer.id,
              message: text,
              senderType: 'CUSTOMER',
              messageType: 'TEXT',
              isRead: false
            }
          });

          console.log(`💬 Yangi mijoz xabari (saytda ko'rinadi): ${customer.name} - ${text}`);
          
          // Mijozga tasdiq xabari
          await enhancedCustomerBot?.sendMessage(chatId, `
✅ Xabaringiz qabul qilindi!

Operatorimiz tez orada javob beradi.

📞 Tezkor yordam: /help
          `, { parse_mode: 'Markdown' });
          
          return; // Boshqa komandalarni ishlatmaslik uchun
        }
      }

      if (text === '🛒 Tezkor buyurtma' || text === '/quick_order') {
        await handleQuickOrder(chatId);
      } else if (text === '💰 Mening balansim' || text === '/balance') {
        await handleEnhancedBalance(chatId);
      } else if (text === '📊 Sotuvlar tarixi' || text === '/history') {
        await handleEnhancedHistory(chatId);
      } else if (text === '🎁 Chegirmalar' || text === '/discounts') {
        await handleDiscounts(chatId);
      } else if (text === '👤 Profil' || text === '/profile') {
        await handleEnhancedProfile(chatId);
      } else if (text === '📞 Yordam' || text === '/help') {
        await handleEnhancedHelp(chatId);
      } else if (text === '📋 Katalog' || text === '/catalog') {
        await handleEnhancedCatalog(chatId);
      } else if (text === '🔔 Bildirishnomalar' || text === '/notifications') {
        await handleNotifications(chatId);
      } else if (text === '🆔 Mening ID\'im' || text === '/myid') {
        await handleMyId(chatId);
      }
    } catch (error) {
      console.error('Enhanced bot message error:', error);
      await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  });

  // Callback query handler
  enhancedCustomerBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    try {
      if (data.startsWith('quick_product_')) {
        const productId = data.replace('quick_product_', '');
        await handleQuickProductSelect(chatId, productId, query.id);
      } else if (data.startsWith('balance_detail_')) {
        const type = data.replace('balance_detail_', '');
        await handleBalanceDetail(chatId, type, query.id);
      } else if (data.startsWith('history_period_')) {
        const period = data.replace('history_period_', '');
        await handleHistoryPeriod(chatId, period, query.id);
      } else if (data.startsWith('discount_')) {
        const discountId = data.replace('discount_', '');
        await handleDiscountSelect(chatId, discountId, query.id);
      } else if (data === 'request_callback') {
        await handleCallbackRequest(chatId, query.id);
      }
    } catch (error) {
      console.error('Enhanced bot callback error:', error);
      await enhancedCustomerBot?.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi!' });
    }
  });
}

// Mijozni topish yoki yaratish
async function findOrCreateCustomer(chatId: number, from: any) {
  try {
    let customer = await prisma.customer.findFirst({
      where: { telegramChatId: chatId.toString() }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: from?.first_name || 'Telegram User',
          phone: from?.username ? `@${from.username}` : '',
          telegramChatId: chatId.toString(),
          telegramUsername: from?.username || '',
          category: 'NEW'
        }
      });
    }

    return customer;
  } catch (error) {
    console.error('Find/Create customer error:', error);
    throw error;
  }
}

// Tezkor buyurtma
async function handleQuickOrder(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) return;

    // Eng ko'p sotilgan mahsulotlar
    const topProducts = await prisma.sale.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 6
    });

    const products = await Promise.all(
      topProducts.map(async (item) => {
        if (!item.productId) return null;
        return await prisma.product.findUnique({
          where: { id: item.productId! }
        });
      })
    );

    const validProducts = products.filter(p => p && p.currentStock > 0);

    if (validProducts.length === 0) {
      await enhancedCustomerBot?.sendMessage(chatId, '😔 Hozircha mavjud mahsulotlar yo\'q');
      return;
    }

    let message = '🛒 **TEZKOR BUYURTMA**\n\n';
    message += '⭐ **Mashhur mahsulotlar:**\n\n';

    const keyboard: { text: string; callback_data: string; }[][] = [];
    for (let i = 0; i < validProducts.length; i += 2) {
      const row: { text: string; callback_data: string; }[] = [];
      const product1 = validProducts[i];
      const product2 = validProducts[i + 1];
      if (product1) {
        row.push({
          text: `${product1.name} - $${product1.pricePerBag}`,
          callback_data: `quick_product_${product1.id}`
        });
      }
      
      if (product2) {
        row.push({
          text: `${product2.name} - $${product2.pricePerBag}`,
          callback_data: `quick_product_${product2.id}`
        });
      }
      keyboard.push(row);
    }

    keyboard.push([
      { text: '📋 Barcha mahsulotlar', callback_data: 'all_products' },
      { text: '🛒 Savatim', callback_data: 'my_cart' }
    ]);

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await logCustomerActivity(customer.id, 'QUICK_ORDER_VIEW');
  } catch (error) {
    console.error('Quick order error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Yaxshilangan balans
async function handleEnhancedBalance(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) return;

    const [totalSales, totalPayments, recentSales, loyaltyPoints] = await Promise.all([
      prisma.sale.aggregate({
        where: { customerId: customer.id },
        _sum: { totalAmount: true },
        _count: true
      }),
      prisma.sale.aggregate({
        where: { customerId: customer.id },
        _sum: { paidAmount: true }
      }),
      prisma.sale.findMany({
        where: { 
          customerId: customer.id,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        take: 100
      }),
      calculateLoyaltyPoints(customer.id)
    ]);

    const totalDebt = (totalSales._sum.totalAmount || 0) - (totalPayments._sum.paidAmount || 0);
    const creditLimit = getCreditLimit(customer.category);

    let message = `
💰 **MOLIYAVIY HISOBOT**

👤 **${customer.name}** (${customer.category})
🏆 **Sadoqat balli:** ${loyaltyPoints} ball

💵 **Moliyaviy holat:**
• Jami xaridlar: $${totalSales._sum.totalAmount || 0}
• To'langan: $${totalPayments._sum.paidAmount || 0}
• Joriy qarz: $${totalDebt.toFixed(2)}
• Kredit limiti: $${creditLimit}

📊 **Statistika:**
• Jami sotuvlar: ${totalSales._count} ta
• Bu oy: ${recentSales.length} ta
• Faollik darajasi: ${getActivityLevel(totalSales._count)}

${totalDebt > 0 ? '⚠️ **To\'lov kerak!**' : '✅ **Qarz yo\'q**'}
    `;

    const keyboard = [
      [
        { text: '💳 To\'lov qilish', callback_data: 'make_payment' },
        { text: '📊 Batafsil', callback_data: 'balance_detail_full' }
      ],
      [
        { text: '🎁 Bonuslar', callback_data: 'balance_detail_bonus' },
        { text: '📞 Qo\'ng\'iroq so\'rash', callback_data: 'request_callback' }
      ]
    ];

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await logCustomerActivity(customer.id, 'BALANCE_VIEW');
  } catch (error) {
    console.error('Enhanced balance error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Yaxshilangan tarix
async function handleEnhancedHistory(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) return;

    const message = `
📊 **SOTUVLAR TARIXI**

Qaysi davr uchun ko'rishni xohlaysiz?
    `;

    const keyboard = [
      [
        { text: '📅 Bu hafta', callback_data: 'history_period_week' },
        { text: '📅 Bu oy', callback_data: 'history_period_month' }
      ],
      [
        { text: '📅 Bu yil', callback_data: 'history_period_year' },
        { text: '📅 Barchasi', callback_data: 'history_period_all' }
      ],
      [
        { text: '📈 Statistika', callback_data: 'history_stats' },
        { text: '📤 Eksport', callback_data: 'history_export' }
      ]
    ];

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (error) {
    console.error('Enhanced history error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Chegirmalar
async function handleDiscounts(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) return;

    const loyaltyPoints = await calculateLoyaltyPoints(customer.id);
    const availableDiscounts = getAvailableDiscounts(customer.category, loyaltyPoints);

    let message = `
🎁 **CHEGIRMALAR VA BONUSLAR**

🏆 **Sizning ballingiz:** ${loyaltyPoints} ball
📊 **Kategoriya:** ${customer.category}

💎 **Mavjud chegirmalar:**
`;

    availableDiscounts.forEach((discount, index) => {
      message += `${index + 1}. ${discount.title}\n`;
      message += `   💰 ${discount.discount}% chegirma\n`;
      message += `   📋 ${discount.description}\n\n`;
    });

    const keyboard = availableDiscounts.map((discount, index) => [{
      text: `🎁 ${discount.title} ishlatish`,
      callback_data: `discount_${index}`
    }]);

    keyboard.push([{ text: '🔄 Yangilash', callback_data: 'refresh_discounts' }]);

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await logCustomerActivity(customer.id, 'DISCOUNTS_VIEW');
  } catch (error) {
    console.error('Discounts error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Yaxshilangan profil
async function handleEnhancedProfile(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) return;

    const [salesCount, totalSpent, lastSale] = await Promise.all([
      prisma.sale.count({ where: { customerId: customer.id } }),
      prisma.sale.aggregate({
        where: { customerId: customer.id },
        _sum: { totalAmount: true }
      }),
      prisma.sale.findFirst({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        include: { product: true }
      })
    ]);

    const loyaltyPoints = await calculateLoyaltyPoints(customer.id);
    const membershipDays = Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const message = `
👤 **PROFIL MA'LUMOTLARI**

📝 **Asosiy ma'lumotlar:**
• Ism: ${customer.name}
• Telefon: ${customer.phone || 'Kiritilmagan'}
• Email: ${customer.email || 'Kiritilmagan'}
• Kategoriya: ${customer.category}

📊 **Statistika:**
• Sotuvlar soni: ${salesCount} ta
• Jami sarflangan: $${totalSpent._sum.totalAmount || 0}
• Sadoqat balli: ${loyaltyPoints} ball
• A'zolik: ${membershipDays} kun

🛒 **Oxirgi xarid:**
${lastSale ? `• ${lastSale.product?.name} - $${lastSale.totalAmount}` : '• Hali xarid qilmagan'}
${lastSale ? `• Sana: ${new Date(lastSale.createdAt).toLocaleDateString()}` : ''}

📱 **Telegram:**
• Username: ${customer.telegramUsername || 'Yo\'q'}
• Chat ID: ${customer.telegramChatId}
    `;

    const keyboard = [
      [
        { text: '✏️ Tahrirlash', callback_data: 'edit_profile' },
        { text: '🔄 Yangilash', callback_data: 'refresh_profile' }
      ],
      [
        { text: '🎁 Bonuslar', callback_data: 'profile_bonuses' },
        { text: '⚙️ Sozlamalar', callback_data: 'profile_settings' }
      ]
    ];

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await logCustomerActivity(customer.id, 'PROFILE_VIEW');
  } catch (error) {
    console.error('Enhanced profile error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Yaxshilangan yordam
async function handleEnhancedHelp(chatId: number) {
  const helpMessage = `
❓ **YORDAM VA QO'LLAB-QUVVATLASH**

🤖 **Bot imkoniyatlari:**
🛒 Tezkor buyurtma berish
💰 Real-time balans kuzatuvi
📊 Batafsil sotuvlar tarixi
🎁 Chegirmalar va bonuslar
👤 Profil boshqaruvi
🔔 Bildirishnomalar

📞 **Aloqa:**
• Sotuvlar bo'limi: @sales_support
• Texnik yordam: @tech_support
• Bosh ofis: +998 XX XXX XX XX
• Email: support@aziztrades.com

🕐 **Ish vaqti:**
Dushanba-Juma: 9:00-18:00
Shanba: 9:00-14:00
Yakshanba: Dam olish kuni

🆘 **Tezkor yordam:**
Favqulodda holatlarda 24/7 qo'llab-quvvatlash
  `;

  const keyboard = [
    [
      { text: '📞 Qo\'ng\'iroq so\'rash', callback_data: 'request_callback' },
      { text: '💬 Chat ochish', callback_data: 'open_chat' }
    ],
    [
      { text: '📋 FAQ', callback_data: 'faq' },
      { text: '📝 Shikoyat', callback_data: 'complaint' }
    ]
  ];

  await enhancedCustomerBot?.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// Yordamchi funksiyalar
async function findCustomerByChatId(chatId: number) {
  return await prisma.customer.findFirst({
    where: { telegramChatId: chatId.toString() }
  });
}

async function logCustomerActivity(customerId: string, activity: string) {
  try {
    // Bu yerda mijoz faolligini log qilish logikasi bo'lishi kerak
    console.log(`Customer ${customerId} activity: ${activity}`);
  } catch (error) {
    console.error('Log activity error:', error);
  }
}

async function calculateLoyaltyPoints(customerId: string): Promise<number> {
  try {
    const totalSpent = await prisma.sale.aggregate({
      where: { customerId },
      _sum: { totalAmount: true }
    });
    
    // Har $10 uchun 1 ball
    return Math.floor((totalSpent._sum.totalAmount || 0) / 10);
  } catch (error) {
    console.error('Calculate loyalty points error:', error);
    return 0;
  }
}

function getCreditLimit(category: string): number {
  switch (category) {
    case 'VIP': return 10000;
    case 'PREMIUM': return 5000;
    case 'REGULAR': return 1000;
    default: return 500;
  }
}

function getActivityLevel(salesCount: number): string {
  if (salesCount >= 50) return '🔥 Juda faol';
  if (salesCount >= 20) return '⭐ Faol';
  if (salesCount >= 5) return '👍 O\'rtacha';
  return '🆕 Yangi';
}

function getAvailableDiscounts(category: string, points: number) {
  const discounts = [];
  
  if (points >= 100) {
    discounts.push({
      title: '10% chegirma',
      discount: 10,
      description: 'Keyingi xaridingizda 10% chegirma'
    });
  }
  
  if (category === 'VIP') {
    discounts.push({
      title: 'VIP chegirma',
      discount: 15,
      description: 'VIP mijozlar uchun maxsus chegirma'
    });
  }
  
  if (points >= 50) {
    discounts.push({
      title: 'Bepul yetkazib berish',
      discount: 0,
      description: 'Keyingi buyurtmangizda bepul yetkazib berish'
    });
  }
  
  return discounts;
}

// Callback handlers
async function handleQuickProductSelect(chatId: number, productId: string, queryId: string) {
  await enhancedCustomerBot?.answerCallbackQuery(queryId, { text: 'Mahsulot savatga qo\'shildi!' });
}

async function handleBalanceDetail(chatId: number, type: string, queryId: string) {
  await enhancedCustomerBot?.answerCallbackQuery(queryId, { text: 'Ma\'lumot yuklanmoqda...' });
}

async function handleHistoryPeriod(chatId: number, period: string, queryId: string) {
  await enhancedCustomerBot?.answerCallbackQuery(queryId, { text: 'Tarix yuklanmoqda...' });
}

async function handleDiscountSelect(chatId: number, discountId: string, queryId: string) {
  await enhancedCustomerBot?.answerCallbackQuery(queryId, { text: 'Chegirma faollashtirildi!' });
}

async function handleCallbackRequest(chatId: number, queryId: string) {
  await enhancedCustomerBot?.answerCallbackQuery(queryId, { text: 'Qo\'ng\'iroq so\'rovi yuborildi!' });
}

async function handleEnhancedCatalog(chatId: number) {
  // Katalog ko'rsatish logikasi
}

async function handleNotifications(chatId: number) {
  // Bildirishnomalar ko'rsatish logikasi
}

// Mijozning ID'sini ko'rsatish
async function handleMyId(chatId: number) {
  try {
    const customer = await findCustomerByChatId(chatId);
    if (!customer) {
      await enhancedCustomerBot?.sendMessage(chatId, '❌ Mijoz topilmadi');
      return;
    }

    // Unique ID yaratish (customer ID ning oxirgi 8 belgisi)
    const uniqueId = customer.id.slice(-8).toUpperCase();

    const message = `
🆔 **SIZNING ID RAQAMINGIZ**

📋 **ID:** \`${uniqueId}\`

Bu ID raqamingizni saqlang! 

📝 **Qanday ishlatiladi:**
1. Saytda "Mijoz Qo'shish" tugmasini bosing
2. "Telegram ID" maydoniga bu raqamni kiriting
3. Boshqa ma'lumotlarni to'ldiring
4. Saqlang

✅ Shundan keyin saytdagi hisobingiz Telegram botga ulanadi va barcha xabarlar va bildirishnomalarni olasiz!

💡 **Eslatma:** Bu ID faqat sizga tegishli va o'zgarmas.
    `;

    await enhancedCustomerBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

    await logCustomerActivity(customer.id, 'MY_ID_VIEW');
  } catch (error) {
    console.error('My ID error:', error);
    await enhancedCustomerBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

// Kunlik eslatmalar
function startDailyReminders() {
  // Har kuni soat 10:00 da eslatma yuborish
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 10 && now.getMinutes() === 0) {
      await sendDailyReminders();
    }
  }, 60000); // Har daqiqada tekshirish
}

async function sendDailyReminders() {
  try {
    // Qarzlari bo'lgan mijozlarga eslatma yuborish
    const debtCustomers = await prisma.customer.findMany({
      where: {
        telegramChatId: { not: null }
      }
    });

    for (const customer of debtCustomers) {
      const debt = await calculateCustomerDebt(customer.id);
      if (debt > 0) {
        await sendDebtReminder(customer, debt);
      }
    }
  } catch (error) {
    console.error('Daily reminders error:', error);
  }
}

async function calculateCustomerDebt(customerId: string): Promise<number> {
  const [totalSales, totalPayments] = await Promise.all([
    prisma.sale.aggregate({
      where: { customerId },
      _sum: { totalAmount: true }
    }),
    prisma.sale.aggregate({
      where: { customerId },
      _sum: { paidAmount: true }
    })
  ]);

  return (totalSales._sum.totalAmount || 0) - (totalPayments._sum.paidAmount || 0);
}

async function sendDebtReminder(customer: any, debt: number) {
  if (!customer.telegramChatId) return;

  const message = `
💰 **QARZ ESLATMASI**

Hurmatli ${customer.name},

Sizning joriy qarzingiz: $${debt.toFixed(2)}

Iltimos, qarzni to'lashni unutmang.

💳 To'lov uchun: /balance
📞 Yordam: /help
  `;

  try {
    await enhancedCustomerBot?.sendMessage(customer.telegramChatId, message, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Send debt reminder error:', error);
  }
}

export { enhancedCustomerBot };