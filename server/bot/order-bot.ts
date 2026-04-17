// Telegram Bot - Buyurtma Berish Funksiyalari
import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../utils/prisma';
import { analyzeOrderAndCreatePlan } from '../utils/ai-order-planner';

// Buyurtma sessiyalari
const orderSessions = new Map<number, {
  step: string;
  customerId?: string;
  items: Array<{ productId: string; productName: string; quantityBags: number; quantityUnits: number; price: number }>;
  requestedDate?: Date;
  notes?: string;
}>();

export function setupOrderCommands(bot: TelegramBot) {
  // /order - Yangi buyurtma berish
  bot.onText(/\/order/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Mijozni topish
    const customer = await prisma.customer.findUnique({
      where: { telegramChatId: chatId.toString() }
    });

    if (!customer) {
      bot.sendMessage(chatId, "Siz ro'yxatdan o'tmagansiz. /register buyrug'ini ishlating.");
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
      bot.sendMessage(chatId, 'Hozirda mahsulotlar mavjud emas.');
      orderSessions.delete(chatId);
      return;
    }

    let message = '<b>Yangi Buyurtma</b>\\n\\n';
    message += '<b>Mavjud Mahsulotlar:</b>\\n\\n';

    const keyboard = {
      inline_keyboard: products.map((product, index) => [
        {
          text: `${index + 1}. ${product.name} - $${product.pricePerBag}/qop (Zaxira: ${product.currentStock})`,
          callback_data: `order_product_${product.id}`
        }
      ])
    };

    keyboard.inline_keyboard.push([
      { text: ' Bekor qilish', callback_data: 'order_cancel' }
    ]);

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // /myorders - Mening buyurtmalarim
  bot.onText(/\/myorders/, async (msg) => {
    const chatId = msg.chat.id;
    
    const customer = await prisma.customer.findUnique({
      where: { telegramChatId: chatId.toString() }
    });

    if (!customer) {
      bot.sendMessage(chatId, "Siz ro'yxatdan o'tmagansiz.");
      return;
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (orders.length === 0) {
      bot.sendMessage(chatId, "Sizda hali buyurtmalar yo'q.\\n\\nYangi buyurtma berish uchun: /order");
      return;
    }

    let message = ' <b>Mening Buyurtmalarim</b>\\n\\n';

    orders.forEach((order, index) => {
      const statusEmoji = {
        PENDING: '',
        CONFIRMED: '',
        IN_PRODUCTION: '',
        READY: '',
        DELIVERED: '',
        CANCELLED: ''
      }[order.status] || '';

      const statusText = {
        PENDING: 'Kutilmoqda',
        CONFIRMED: 'Tasdiqlandi',
        IN_PRODUCTION: 'Ishlab chiqarilmoqda',
        READY: 'Tayyor',
        DELIVERED: 'Yetkazildi',
        CANCELLED: 'Bekor qilindi'
      }[order.status] || order.status;

      message += `${index + 1}. ${statusEmoji} <b>#${order.orderNumber}</b>\\n`;
      message += `    ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}\\n`;
      message += `    ${order.items.length} xil mahsulot\\n`;
      message += `    ${order.totalAmount.toFixed(2)} USD\\n`;
      message += `    ${statusText}\\n`;
      
      if (order.promisedDate) {
        message += `    Tayyor bo\\'ladi: ${new Date(order.promisedDate).toLocaleDateString('uz-UZ')}\\n`;
      }
      
      message += '\\n';
    });

    message += '\\n<i>Yangi buyurtma berish: /order</i>';

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  });

  // Callback query handler - Buyurtma jarayoni
  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data || '';

    // Mahsulot tanlash
    if (data.startsWith('order_product_')) {
      const productId = data.replace('order_product_', '');
      const session = orderSessions.get(chatId);

      if (!session) {
        bot.answerCallbackQuery(query.id, { text: 'Sessiya tugadi. /order dan qayta boshlang.' });
        return;
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        bot.answerCallbackQuery(query.id, { text: 'Mahsulot topilmadi' });
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
 <b>${product.name}</b> tanlandi

 Narx: $${product.pricePerBag}/qop
 Zaxira: ${product.currentStock} qop
 Bir qopda: ${product.unitsPerBag} dona

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
            { text: ' Bekor qilish', callback_data: 'order_cancel' }
          ]
        ]
      };

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message!.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });

      bot.answerCallbackQuery(query.id);
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
            { text: " Yana mahsulot qo'shish", callback_data: 'order_add_more' }
          ],
          [
            { text: ' Buyurtmani yakunlash', callback_data: 'order_finish' }
          ],
          [
            { text: ' Bekor qilish', callback_data: 'order_cancel' }
          ]
        ]
      };

      let message = ' <b>Mahsulot qo\'shildi!</b>\\n\\n';
      message += '<b>Joriy buyurtma:</b>\\n';
      
      session.items.forEach((item, index) => {
        message += `${index + 1}. ${item.productName}\\n`;
        if (item.quantityBags > 0) {
          message += `    ${item.quantityBags} qop  $${item.price}\\n`;
        }
        if (item.quantityUnits > 0) {
          message += `    ${item.quantityUnits} dona\\n`;
        }
      });

      const total = session.items.reduce((sum, item) => {
        return sum + (item.quantityBags * item.price);
      }, 0);

      message += `\\n <b>Jami:</b> $${total.toFixed(2)}`;

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message!.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });

      bot.answerCallbackQuery(query.id, { text: "Qo'shildi!" });
    }

    // Yana mahsulot qo'shish
    else if (data === 'order_add_more') {
      // Mahsulotlar ro'yxatini qayta ko'rsatish
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
        { text: ' Buyurtmani yakunlash', callback_data: 'order_finish' }
      ]);

      bot.editMessageReplyMarkup(keyboard, {
        chat_id: chatId,
        message_id: query.message!.message_id
      });

      bot.answerCallbackQuery(query.id);
    }

    // Buyurtmani yakunlash
    else if (data === 'order_finish') {
      const session = orderSessions.get(chatId);
      if (!session || session.items.length === 0) {
        bot.answerCallbackQuery(query.id, { text: "Buyurtmada mahsulot yo'q" });
        return;
      }

      // Qachon kerak?
      const keyboard = {
        inline_keyboard: [
          [
            { text: ' Tezkor (24 soat)', callback_data: 'order_date_immediate' }
          ],
          [
            { text: ' Ertaga', callback_data: 'order_date_tomorrow' },
            { text: ' 3 kun', callback_data: 'order_date_3days' }
          ],
          [
            { text: ' 1 hafta', callback_data: 'order_date_week' },
            { text: ' 2 hafta', callback_data: 'order_date_2weeks' }
          ],
          [
            { text: ' Bekor qilish', callback_data: 'order_cancel' }
          ]
        ]
      };

      bot.editMessageText(
        ' <b>Qachon kerak?</b>\\n\\nYetkazib berish sanasini tanlang:',
        {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: 'HTML',
          reply_markup: keyboard
        }
      );

      bot.answerCallbackQuery(query.id);
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

        const order = await prisma.order.create({
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
          await prisma.orderItem.create({
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
        let message = ' <b>Buyurtma qabul qilindi!</b>\\n\\n';
        message += ` Buyurtma: <b>#${order.orderNumber}</b>\\n`;
        message += ` Sana: ${requestedDate.toLocaleDateString('uz-UZ')}\\n`;
        message += ` Summa: $${totalAmount.toFixed(2)}\\n\\n`;
        
        message += '<b>Mahsulotlar:</b>\\n';
        session.items.forEach((item, index) => {
          message += `${index + 1}. ${item.productName}\\n`;
          if (item.quantityBags > 0) message += `    ${item.quantityBags} qop\\n`;
          if (item.quantityUnits > 0) message += `    ${item.quantityUnits} dona\\n`;
        });

        message += `\\n <b>AI Tahlil:</b>\\n`;
        message += ` Ishonch: ${aiResult.aiConfidence.toFixed(0)}%\\n`;
        
        if (aiResult.recommendations.length > 0) {
          message += `\\n <b>Tavsiyalar:</b>\\n`;
          aiResult.recommendations.slice(0, 2).forEach(rec => {
            message += ` ${rec.description}\\n`;
          });
        }

        message += `\\n Buyurtmangiz ko\\'rib chiqilmoqda!\\n`;
        message += ` Tez orada aloqaga chiqamiz.`;

        bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: 'HTML'
        });

        // Sessiyani tozalash
        orderSessions.delete(chatId);

        bot.answerCallbackQuery(query.id, { text: 'Buyurtma yuborildi!' });

      } catch (error) {
        console.error('Order creation error:', error);
        bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi' });
      }
    }

    // Bekor qilish
    else if (data === 'order_cancel') {
      orderSessions.delete(chatId);
      bot.editMessageText(
        ' Buyurtma bekor qilindi.\\n\\nYangi buyurtma berish: /order',
        {
          chat_id: chatId,
          message_id: query.message!.message_id
        }
      );
      bot.answerCallbackQuery(query.id, { text: 'Bekor qilindi' });
    }
  });

  // Matn xabarlari - Miqdor kiritish
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const session = orderSessions.get(chatId);

    if (!session || session.step !== 'ENTER_QUANTITY') return;
    if (text.startsWith('/')) return; // Buyruqlarni o'tkazib yuborish

    // Miqdorni parse qilish
    const bagMatch = text.match(/(\\d+)\\s*(qop|bag)/i);
    const unitMatch = text.match(/(\\d+)\\s*(dona|unit|pc)/i);

    if (!bagMatch && !unitMatch) {
      bot.sendMessage(chatId, "Noto'g'ri format. Masalan: <code>100 qop</code> yoki <code>5000 dona</code>", {
        parse_mode: 'HTML'
      });
      return;
    }

    const lastItem = session.items[session.items.length - 1];
    
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
          { text: " Yana mahsulot qo'shish", callback_data: 'order_add_more' }
        ],
        [
          { text: ' Buyurtmani yakunlash', callback_data: 'order_finish' }
        ]
      ]
    };

    bot.sendMessage(chatId, "Qo'shildi! Davom ettirasizmi?", {
      reply_markup: keyboard
    });
  });
}
