import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../utils/prisma';

// FormatCurrency funksiyasi
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS'
  }).format(amount);
}

// Har bir haydovchi uchun alohida bot instance
const driverBots = new Map<string, TelegramBot>();

export class DriverBotManager {
  
  // Haydovchi botini ishga tushirish
  static async initDriverBot(driverId: string, token: string) {
    try {
      if (driverBots.has(driverId)) {
        console.log(`🚗 Driver bot ${driverId} already running`);
        return driverBots.get(driverId);
      }

      const bot = new TelegramBot(token, { polling: true });
      driverBots.set(driverId, bot);

      await this.setupDriverCommands(bot, driverId);
      
      console.log(`🚗 Driver Bot ${driverId} ishga tushdi!`);
      return bot;
    } catch (error) {
      console.error(`Driver Bot ${driverId} xatolik:`, error);
      return null;
    }
  }

  // Haydovchi komandalarini sozlash
  static async setupDriverCommands(bot: TelegramBot, driverId: string) {
    
    // Start komandasi
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      
      // Haydovchini topish va chat ID ni yangilash
      const driver = await this.findAndUpdateDriver(driverId, chatId, msg.from);
      
      if (!driver) {
        await bot.sendMessage(chatId, '❌ Siz ro\'yxatdan o\'tmagan haydovchisiz!');
        return;
      }

      const welcomeMessage = `
🚗 **Xush kelibsiz, ${driver.name}!**

🚚 **HAYDOVCHI BOTI**

Bu bot orqali siz:
📋 Buyurtmalarni qabul qilishingiz
📍 Joylashuvingizni yuborishingiz  
💬 Admin bilan muloqot qilishingiz
� Pul qabul qilishingiz
�� Statistikangizni ko'rishingiz mumkin

📱 **Asosiy funktsiyalar:**
📋 Buyurtmalar - Faol buyurtmalar
📍 Joylashuv - Joylashuv yuborish
💬 Admin chat - Admin bilan bog'lanish
💰 Pul qabul qilish - To'lovlarni qabul qilish
📊 Statistika - Ish statistikasi
🟢 Online - Ishga tayyor
🔴 Offline - Dam olish

🟢 **Holat:** ${driver.status}
⭐ **Reyting:** ${driver.rating}/5.0
🚚 **Jami yetkazishlar:** ${driver.totalDeliveries}
💰 **Jami daromad:** ${formatCurrency(0)}
      `;

      await bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📋 Buyurtmalar' }, { text: '📍 Joylashuv' }],
            [{ text: '💬 Admin chat' }, { text: '💰 Pul qabul qilish' }],
            [{ text: '📊 Statistika' }, { text: '⚙️ Sozlamalar' }],
            [{ text: '🟢 Online' }, { text: '🔴 Offline' }],
            [{ text: '❓ Yordam' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      });
    });

    // Tugma bosilganda
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (text === '📋 Buyurtmalar' || text === '/orders') {
        await this.handleOrders(bot, chatId, driverId);
      } else if (text === '📍 Joylashuv' || text === '/location') {
        await this.handleLocationRequest(bot, chatId, driverId);
      } else if (text === '💬 Admin chat' || text === '/chat') {
        await this.handleAdminChat(bot, chatId, driverId);
      } else if (text === '📊 Statistika' || text === '/stats') {
        await this.handleStats(bot, chatId, driverId);
      } else if (text === '� Pul qabul qilish') {
        await this.handlePaymentReception(bot, chatId, driverId);
      } else if (text === '� Online') {
        await this.updateDriverStatus(bot, chatId, driverId, 'AVAILABLE');
      } else if (text === '🔴 Offline') {
        await this.updateDriverStatus(bot, chatId, driverId, 'OFFLINE');
      } else if (text === '❓ Yordam' || text === '/help') {
        await this.handleHelp(bot, chatId);
      }
    });

    // Callback query handler
    bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const data = query.data;

      if (!chatId || !data) return;

      try {
        if (data.startsWith('accept_order_')) {
          const assignmentId = data.replace('accept_order_', '');
          await this.handleAcceptOrder(bot, chatId, driverId, assignmentId, query.id);
        } else if (data.startsWith('reject_order_')) {
          const assignmentId = data.replace('reject_order_', '');
          await this.handleRejectOrder(bot, chatId, driverId, assignmentId, query.id);
        } else if (data.startsWith('complete_order_')) {
          const assignmentId = data.replace('complete_order_', '');
          await this.handleCompleteOrder(bot, chatId, driverId, assignmentId, query.id);
        } else if (data.startsWith('start_delivery_')) {
          const assignmentId = data.replace('start_delivery_', '');
          await this.handleStartDelivery(bot, chatId, driverId, assignmentId, query.id);
        }
      } catch (error) {
        console.error('Driver bot callback error:', error);
      }
    });

    // Joylashuv qabul qilish
    bot.on('location', async (msg) => {
      const chatId = msg.chat.id;
      const location = msg.location;
      
      if (location) {
        await this.saveDriverLocation(driverId, location);
        await bot.sendMessage(chatId, '📍 Joylashuvingiz saqlandi!');
      }
    });
  }

  // Haydovchini topish va yangilash
  static async findAndUpdateDriver(driverId: string, chatId: number, from: any) {
    try {
      const driver = await prisma.driver.update({
        where: { id: driverId },
        data: {
          telegramChatId: chatId.toString(),
          telegramUsername: from?.username || null
        }
      });
      return driver;
    } catch (error) {
      console.error('Find/Update driver error:', error);
      return null;
    }
  }

  // Buyurtmalarni ko'rsatish
  static async handleOrders(bot: TelegramBot, chatId: number, driverId: string) {
    try {
      const assignments = await prisma.deliveryAssignment.findMany({
        where: { 
          driverId,
          status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
        },
        include: {
          order: {
            include: { customer: true }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      if (assignments.length === 0) {
        await bot.sendMessage(chatId, '📋 Hozircha yangi buyurtmalar yo\'q');
        return;
      }

      let message = '📋 **SIZNING BUYURTMALARINGIZ**\n\n';

      for (const assignment of assignments) {
        const statusEmoji = {
          'PENDING': '⏳',
          'ACCEPTED': '✅',
          'IN_PROGRESS': '🚚',
          'COMPLETED': '✅'
        }[assignment.status] || '❓';

        message += `${statusEmoji} **Buyurtma #${assignment.order.orderNumber}**\n`;
        message += `👤 Mijoz: ${assignment.order.customer.name}\n`;
        message += `📍 Manzil: ${assignment.deliveryAddress}\n`;
        message += `💰 Summa: ${assignment.order.totalAmount}\n`;
        message += `📞 Telefon: ${assignment.customerPhone || assignment.order.customer.phone}\n`;
        message += `⏰ Tayinlangan: ${new Date(assignment.assignedAt).toLocaleString()}\n\n`;
      }

      const keyboard = [];
      for (const assignment of assignments) {
        const row = [];
        
        if (assignment.status === 'PENDING') {
          row.push(
            { text: `✅ Qabul - #${assignment.order.orderNumber}`, callback_data: `accept_order_${assignment.id}` },
            { text: `❌ Rad - #${assignment.order.orderNumber}`, callback_data: `reject_order_${assignment.id}` }
          );
        } else if (assignment.status === 'ACCEPTED') {
          row.push(
            { text: `🚚 Boshlash - #${assignment.order.orderNumber}`, callback_data: `start_delivery_${assignment.id}` }
          );
        } else if (assignment.status === 'IN_PROGRESS') {
          row.push(
            { text: `✅ Tugallash - #${assignment.order.orderNumber}`, callback_data: `complete_order_${assignment.id}` }
          );
        }
        
        if (row.length > 0) {
          keyboard.push(row);
        }
      }

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });

    } catch (error) {
      console.error('Handle orders error:', error);
      await bot.sendMessage(chatId, '❌ Buyurtmalarni yuklashda xatolik');
    }
  }

  // Buyurtmani qabul qilish
  static async handleAcceptOrder(bot: TelegramBot, chatId: number, driverId: string, assignmentId: string, queryId: string) {
    try {
      const assignment = await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: 'ACCEPTED',
          acceptedAt: new Date()
        },
        include: {
          order: {
            include: { customer: true }
          }
        }
      });

      // Haydovchi holatini yangilash
      await prisma.driver.update({
        where: { id: driverId },
        data: { status: 'BUSY' }
      });

      await bot.answerCallbackQuery(queryId, { text: '✅ Buyurtma qabul qilindi!' });

      const message = `
✅ **BUYURTMA QABUL QILINDI**

📋 **Buyurtma:** #${assignment.order.orderNumber}
👤 **Mijoz:** ${assignment.order.customer.name}
📍 **Manzil:** ${assignment.deliveryAddress}
📞 **Telefon:** ${assignment.customerPhone || assignment.order.customer.phone}
💰 **Summa:** ${assignment.order.totalAmount}

🚚 Yetkazib berishni boshlash uchun "Boshlash" tugmasini bosing.

📞 Mijoz bilan bog'lanish: ${assignment.order.customer.phone}
      `;

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚚 Yetkazib berishni boshlash', callback_data: `start_delivery_${assignmentId}` }],
            [{ text: '💬 Admin bilan bog\'lanish', callback_data: 'contact_admin' }]
          ]
        }
      });

      // Admin'ga xabar yuborish
      await this.notifyAdminOrderAccepted(assignment);

    } catch (error) {
      console.error('Accept order error:', error);
      await bot.answerCallbackQuery(queryId, { text: '❌ Xatolik yuz berdi!' });
    }
  }

  // Buyurtmani rad etish
  static async handleRejectOrder(bot: TelegramBot, chatId: number, driverId: string, assignmentId: string, queryId: string) {
    try {
      await bot.answerCallbackQuery(queryId, { text: 'Rad etish sababini yozing...' });
      
      await bot.sendMessage(chatId, '❌ Buyurtmani rad etish sababini yozing:');
      
      // Keyingi xabarni kutish
      const reasonHandler = async (msg: any) => {
        if (msg.chat.id === chatId && msg.text) {
          await prisma.deliveryAssignment.update({
            where: { id: assignmentId },
            data: { 
              status: 'REJECTED',
              rejectionReason: msg.text
            }
          });

          await bot.sendMessage(chatId, '❌ Buyurtma rad etildi');
          
          // Admin'ga xabar yuborish
          await this.notifyAdminOrderRejected(assignmentId, msg.text);
          
          bot.removeListener('message', reasonHandler);
        }
      };
      
      bot.on('message', reasonHandler);

    } catch (error) {
      console.error('Reject order error:', error);
      await bot.answerCallbackQuery(queryId, { text: '❌ Xatolik yuz berdi!' });
    }
  }

  // Yetkazib berishni boshlash
  static async handleStartDelivery(bot: TelegramBot, chatId: number, driverId: string, assignmentId: string, queryId: string) {
    try {
      await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });

      await bot.answerCallbackQuery(queryId, { text: '🚚 Yetkazib berish boshlandi!' });

      await bot.sendMessage(chatId, `
🚚 **YETKAZIB BERISH BOSHLANDI**

📍 Joylashuvingizni muntazam yuborib turing.
📞 Mijoz bilan bog'laning va yetkazib berish vaqtini xabar qiling.

⏰ Yetkazib berish tugagach "Tugallash" tugmasini bosing.
      `, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Yetkazib berishni tugallash', callback_data: `complete_order_${assignmentId}` }],
            [{ text: '📍 Joylashuv yuborish', callback_data: 'send_location' }]
          ]
        }
      });

      // Admin'ga xabar yuborish
      await this.notifyAdminDeliveryStarted(assignmentId);

    } catch (error) {
      console.error('Start delivery error:', error);
      await bot.answerCallbackQuery(queryId, { text: '❌ Xatolik yuz berdi!' });
    }
  }

  // Yetkazib berishni tugallash
  static async handleCompleteOrder(bot: TelegramBot, chatId: number, driverId: string, assignmentId: string, queryId: string) {
    try {
      const assignment = await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date()
        },
        include: {
          order: {
            include: { customer: true }
          }
        }
      });

      // Haydovchi statistikasini yangilash
      await prisma.driver.update({
        where: { id: driverId },
        data: { 
          status: 'AVAILABLE',
          totalDeliveries: { increment: 1 }
        }
      });

      // Buyurtma holatini yangilash
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { 
          status: 'DELIVERED',
          deliveredDate: new Date()
        }
      });

      await bot.answerCallbackQuery(queryId, { text: '✅ Yetkazib berish tugallandi!' });

      await bot.sendMessage(chatId, `
🎉 **YETKAZIB BERISH TUGALLANDI**

📋 **Buyurtma:** #${assignment.order.orderNumber}
👤 **Mijoz:** ${assignment.order.customer.name}
💰 **Summa:** ${assignment.order.totalAmount}
⏰ **Tugallangan:** ${new Date().toLocaleString()}

✅ Rahmat! Keyingi buyurtmalarni kutib turing.
      `, {
        parse_mode: 'Markdown'
      });

      // Admin va mijozga xabar yuborish
      await this.notifyAdminDeliveryCompleted(assignment);
      await this.notifyCustomerDeliveryCompleted(assignment);

    } catch (error) {
      console.error('Complete order error:', error);
      await bot.answerCallbackQuery(queryId, { text: '❌ Xatolik yuz berdi!' });
    }
  }

  // Joylashuvni saqlash
  static async saveDriverLocation(driverId: string, location: any) {
    try {
      await prisma.driverLocation.create({
        data: {
          driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date()
        }
      });

      // Haydovchi joylashuvini yangilash
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          currentLocation: `${location.latitude},${location.longitude}`
        }
      });

    } catch (error) {
      console.error('Save location error:', error);
    }
  }

  // Haydovchi holatini yangilash
  static async updateDriverStatus(bot: TelegramBot, chatId: number, driverId: string, status: string) {
    try {
      await prisma.driver.update({
        where: { id: driverId },
        data: { status }
      });

      const statusText = status === 'AVAILABLE' ? '🟢 Online' : '🔴 Offline';
      await bot.sendMessage(chatId, `${statusText} Holatingiz yangilandi`);

    } catch (error) {
      console.error('Update status error:', error);
      await bot.sendMessage(chatId, '❌ Holatni yangilashda xatolik');
    }
  }

  // Admin chat
  static async handleAdminChat(bot: TelegramBot, chatId: number, driverId: string) {
    await bot.sendMessage(chatId, `
💬 **ADMIN BILAN CHAT**

Xabaringizni yozing, admin javob beradi:
    `, {
      parse_mode: 'Markdown'
    });
  }

  // Statistika
  static async handleStats(bot: TelegramBot, chatId: number, driverId: string) {
    try {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      });

      const todayDeliveries = await prisma.deliveryAssignment.count({
        where: {
          driverId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      const monthDeliveries = await prisma.deliveryAssignment.count({
        where: {
          driverId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      await bot.sendMessage(chatId, `
📊 **STATISTIKA**

👤 **Haydovchi:** ${driver?.name}
⭐ **Reyting:** ${driver?.rating}/5.0
🚚 **Jami yetkazishlar:** ${driver?.totalDeliveries}

📅 **Bugun:** ${todayDeliveries} ta
📅 **Bu oy:** ${monthDeliveries} ta

🟢 **Holat:** ${driver?.status}
📍 **Joylashuv:** ${driver?.currentLocation || 'Noma\'lum'}
      `, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Stats error:', error);
      await bot.sendMessage(chatId, '❌ Statistikani yuklashda xatolik');
    }
  }

  // Yordam
  static async handleHelp(bot: TelegramBot, chatId: number) {
    await bot.sendMessage(chatId, `
❓ **YORDAM**

🚗 **Haydovchi boti** quyidagi imkoniyatlarni taqdim etadi:

📋 **Buyurtmalar**
• Yangi buyurtmalarni qabul qilish
• Buyurtmalarni rad etish
• Yetkazib berishni boshlash va tugallash

📍 **Joylashuv**
• Joriy joylashuvni yuborish
• GPS orqali kuzatish

💬 **Muloqot**
• Admin bilan chat
• Mijoz bilan bog'lanish

📊 **Statistika**
• Kunlik/oylik hisobotlar
• Reyting va baholash

🔧 **Sozlamalar**
• Online/Offline holat
• Bildirishnomalar

📞 **Yordam:**
• Texnik muammolar: @support
• Admin: @admin
• Telefon: +998 XX XXX XX XX
    `, {
      parse_mode: 'Markdown'
    });
  }

  // Joylashuv so'rash
  static async handleLocationRequest(bot: TelegramBot, chatId: number, driverId: string) {
    await bot.sendMessage(chatId, '📍 Joylashuvingizni yuboring:', {
      reply_markup: {
        keyboard: [
          [{ text: '📍 Joylashuv yuborish', request_location: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }

  // Bildirishnomalar
  static async notifyAdminOrderAccepted(assignment: any) {
    // Admin botga xabar yuborish logikasi
    console.log(`✅ Haydovchi buyurtmani qabul qildi: ${assignment.order.orderNumber}`);
  }

  static async notifyAdminOrderRejected(assignmentId: string, reason: string) {
    console.log(`❌ Haydovchi buyurtmani rad etdi: ${assignmentId}, Sabab: ${reason}`);
  }

  static async notifyAdminDeliveryStarted(assignmentId: string) {
    console.log(`🚚 Yetkazib berish boshlandi: ${assignmentId}`);
  }

  static async notifyAdminDeliveryCompleted(assignment: any) {
    console.log(`✅ Yetkazib berish tugallandi: ${assignment.order.orderNumber}`);
  }

  static async notifyCustomerDeliveryCompleted(assignment: any) {
    console.log(`📞 Mijozga xabar: ${assignment.order.customer.name}`);
  }

  // Haydovchiga buyurtma tayinlash
  static async assignOrderToDriver(orderId: string, driverId: string, adminId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true }
      });

      if (!order) return null;

      const assignment = await prisma.deliveryAssignment.create({
        data: {
          orderId,
          driverId,
          assignedBy: adminId,
          deliveryAddress: order.customer.address || 'Manzil kiritilmagan',
          customerPhone: order.customer.phone
        }
      });

      // Haydovchiga xabar yuborish
      const bot = driverBots.get(driverId);
      if (bot) {
        const driver = await prisma.driver.findUnique({
          where: { id: driverId }
        });

        if (driver?.telegramChatId) {
          await bot.sendMessage(driver.telegramChatId, `
🚚 **YANGI BUYURTMA**

📋 **Buyurtma:** #${order.orderNumber}
👤 **Mijoz:** ${order.customer.name}
📍 **Manzil:** ${assignment.deliveryAddress}
📞 **Telefon:** ${assignment.customerPhone}
💰 **Summa:** ${order.totalAmount}

Buyurtmani qabul qilasizmi?
          `, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Qabul qilish', callback_data: `accept_order_${assignment.id}` },
                  { text: '❌ Rad etish', callback_data: `reject_order_${assignment.id}` }
                ]
              ]
            }
          });
        }
      }

      return assignment;

    } catch (error) {
      console.error('Assign order error:', error);
      return null;
    }
  }

  // Pul qabul qilish
  static async handlePaymentReception(bot: TelegramBot, chatId: number, driverId: string) {
    try {
      // Oxirgi to'lovlarni olish
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
        await bot.sendMessage(chatId, '💰 *Kutayotgan to\'lovlar yo\'q*', {
          parse_mode: 'Markdown'
        });
        return;
      }

      let message = `💰 *Qabul qilingan To'lovlar (${recentPayments.length}):*\n\n`;
      
      const keyboard: { inline_keyboard: any[][] } = {
        inline_keyboard: []
      };

      recentPayments.forEach((payment, index) => {
        const remaining = payment.totalAmount - payment.paidAmount;
        message += `🔹 *To'lov #${index + 1}*\n`;
        message += `💰 Summa: ${formatCurrency(payment.paidAmount)}\n`;
        message += `👤 Mijoz: ${payment.customer.name}\n`;
        message += `📋 Buyurtma: ${payment.orderNumber}\n`;
        message += `📅 Sana: ${new Date(payment.updatedAt).toLocaleDateString('uz-UZ')}\n\n`;
        
        keyboard.inline_keyboard.push([
          { text: `✅ Qabul qilish #${index + 1}`, callback_data: `receive_payment_${payment.id}` },
          { text: `📞 Mijozga aloqa #${index + 1}`, callback_data: `contact_customer_${payment.id}` }
        ]);
      });

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Handle payment reception error:', error);
      await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
    }
  }

  // Botni to'xtatish
  static stopDriverBot(driverId: string) {
    const bot = driverBots.get(driverId);
    if (bot) {
      bot.stopPolling();
      driverBots.delete(driverId);
      console.log(`🚗 Driver Bot ${driverId} to'xtatildi`);
    }
  }

  // Barcha botlarni olish
  static getAllDriverBots() {
    return Array.from(driverBots.entries());
  }
}

export { driverBots };