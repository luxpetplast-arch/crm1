import { PrismaClient } from '@prisma/client';
import { botManager } from '../bot/bot-manager';

const prisma = new PrismaClient();

export class OrderWorkflow {
  
  // Mijoz botdan buyurtma berganida
  static async processCustomerOrder(orderData: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      pricePerBag: number;
    }>;
    telegramChatId: string;
  }) {
    try {
      console.log('🔄 Buyurtma jarayoni boshlandi...');

      // 1. Buyurtma yaratish (CONFIRMED statusida boshlanadi)
      const orderNumber = `ORD-${Date.now()}`;
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: orderData.customerId,
          status: 'CONFIRMED',
          totalAmount: orderData.items.reduce((sum, item) => sum + (item.quantity * item.pricePerBag), 0),
          requestedDate: new Date(),
          notes: JSON.stringify(orderData.items)
        },
        include: {
          customer: true
        }
      });

      console.log(`✅ Buyurtma yaratildi: ${order.orderNumber}`);

      // 2. Mijozga tasdiqlash xabari
      await this.notifyCustomerOrderReceived(orderData.telegramChatId, order);

      // 3. Har bir mahsulot uchun ombor holatini tekshirish
      const processedItems = [];
      for (const item of orderData.items) {
        const stockCheck = await this.checkStockAvailability(item.productId, item.quantity);
        processedItems.push({
          ...item,
          stockStatus: stockCheck
        });
      }

      // 4. Omborda yo'q mahsulotlar uchun ishlab chiqarish buyurtmasi
      const outOfStockItems = processedItems.filter(item => !item.stockStatus.available);
      if (outOfStockItems.length > 0) {
        await this.createProductionOrder(order.id, outOfStockItems);
      }

      // 5. Mavjud mahsulotlar uchun darhol logistikaga yuborish
      const availableItems = processedItems.filter(item => item.stockStatus.available);
      if (availableItems.length > 0) {
        await this.createDeliveryOrder(order.id, availableItems);
      }

      // 6. Admin botga xabar yuborish
      await this.notifyAdminNewOrder(order, processedItems);

      return {
        success: true,
        order,
        stockStatus: processedItems
      };

    } catch (error) {
      console.error('❌ Buyurtma jarayonida xatolik:', error);
      throw error;
    }
  }

  // Ombor holatini tekshirish
  static async checkStockAvailability(productId: string, requestedQuantity: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return {
          available: false,
          reason: 'PRODUCT_NOT_FOUND',
          currentStock: 0,
          requestedQuantity
        };
      }

      const available = product.currentStock >= requestedQuantity;
      
      return {
        available,
        reason: available ? 'IN_STOCK' : 'INSUFFICIENT_STOCK',
        currentStock: product.currentStock,
        requestedQuantity,
        productName: product.name
      };
    } catch (error) {
      console.error('Ombor tekshirishda xatolik:', error);
      return {
        available: false,
        reason: 'CHECK_ERROR',
        currentStock: 0,
        requestedQuantity
      };
    }
  }

  // Ishlab chiqarish buyurtmasi yaratish
  static async createProductionOrder(orderId: string, items: any[]) {
    try {
      console.log('🏭 Ishlab chiqarish buyurtmasi yaratilmoqda...');

      for (const item of items) {
        const orderNumber = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const productionOrder = await prisma.productionOrder.create({
          data: {
            orderNumber,
            productId: item.productId,
            targetQuantity: item.quantity,
            status: 'PLANNED',
            plannedDate: new Date(),
            shift: 'DAY',
            supervisorId: 'system',
            notes: `Buyurtma #${orderId} uchun ishlab chiqarish`
          }
        });

        console.log(`✅ Ishlab chiqarish buyurtmasi yaratildi: ${productionOrder.id}`);

        // Production botga xabar yuborish
        await this.notifyProductionBot(productionOrder, item);
      }

      // Buyurtma holatini yangilash
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'IN_PRODUCTION' }
      });

    } catch (error) {
      console.error('Ishlab chiqarish buyurtmasida xatolik:', error);
      throw error;
    }
  }

  // Yetkazib berish buyurtmasi yaratish
  static async createDeliveryOrder(orderId: string, items: any[]) {
    try {
      console.log('🚚 Yetkazib berish buyurtmasi yaratilmoqda...');

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true }
      });

      if (!order) return;

      // Mavjud haydovchilarni topish
      const availableDrivers = await prisma.driver.findMany({
        where: { 
          status: 'AVAILABLE',
          active: true 
        },
        orderBy: { totalDeliveries: 'asc' } // Eng kam yetkazish qilgan haydovchini tanlash
      });

      if (availableDrivers.length > 0) {
        // Eng yaxshi haydovchini tanlash
        const selectedDriver = availableDrivers[0];
        
        // Haydovchiga buyurtma tayinlash
        const assignment = await prisma.deliveryAssignment.create({
          data: {
            orderId: order.id,
            driverId: selectedDriver.id,
            assignedBy: 'system',
            deliveryAddress: order.customer.address || 'Manzil kiritilmagan',
            customerPhone: order.customer.phone,
            estimatedTime: 60 // 1 soat
          }
        });

        console.log(`✅ Haydovchiga tayinlandi: ${selectedDriver.name}`);

        // Haydovchiga bot orqali xabar yuborish
        await this.notifyDriverNewAssignment(selectedDriver, order, assignment);

        // Mijozga haydovchi ma'lumotlarini yuborish
        await this.notifyCustomerDriverAssigned(order, selectedDriver, assignment);
      }

      // Logistics botga xabar yuborish
      await this.notifyLogisticsBot(order, items);

      // Ombor holatini yangilash
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Buyurtma holatini yangilash
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'READY_FOR_DELIVERY' }
      });

    } catch (error) {
      console.error('Yetkazib berish buyurtmasida xatolik:', error);
      throw error;
    }
  }

  // Ishlab chiqarish tugaganida
  static async onProductionCompleted(productionId: string) {
    try {
      console.log('🏭 Ishlab chiqarish tugadi, logistikaga yuborilmoqda...');

      const production = await prisma.productionOrder.findUnique({
        where: { id: productionId }
      });

      if (!production) return;

      // Mahsulot ma'lumotlarini olish
      const product = await prisma.product.findUnique({
        where: { id: production.productId }
      });

      if (!product) return;

      // Ombor holatini yangilash
      await prisma.product.update({
        where: { id: production.productId },
        data: {
          currentStock: {
            increment: production.actualQuantity || production.targetQuantity
          }
        }
      });

      // Tegishli buyurtmalarni topish
      const orders = await prisma.order.findMany({
        where: {
          status: 'IN_PRODUCTION',
          notes: {
            contains: production.productId
          }
        },
        include: { customer: true }
      });

      // Har bir buyurtma uchun yetkazib berish yaratish
      for (const order of orders) {
        const items = JSON.parse(order.notes || '[]');
        const relevantItems = items.filter((item: any) => item.productId === production.productId);
        
        if (relevantItems.length > 0) {
          await this.createDeliveryOrder(order.id, relevantItems);

          // Mijozga xabar yuborish
          if (order.customer.telegramChatId) {
            await this.notifyCustomerProductionCompleted(
              order.customer.telegramChatId, 
              order, 
              { ...production, product }
            );
          }
        }
      }

    } catch (error) {
      console.error('Ishlab chiqarish tugashida xatolik:', error);
      throw error;
    }
  }

  // Yetkazib berish tugaganida
  static async onDeliveryCompleted(orderId: string) {
    try {
      console.log('🚚 Yetkazib berish tugadi');

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true }
      });

      if (!order) return;

      // Buyurtma holatini yangilash
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'DELIVERED',
          deliveredDate: new Date()
        }
      });

      // Mijozga xabar yuborish
      if (order.customer.telegramChatId) {
        await this.notifyCustomerDeliveryCompleted(order.customer.telegramChatId, order);
      }

      // Admin botga hisobot yuborish
      await this.notifyAdminDeliveryCompleted(order);

    } catch (error) {
      console.error('Yetkazib berish tugashida xatolik:', error);
      throw error;
    }
  }

  // Bildirishnoma funksiyalari
  static async notifyCustomerOrderReceived(telegramChatId: string, order: any) {
    const customerBot = botManager.getBot('customer') || botManager.getBot('customer-premium');
    if (!customerBot || !telegramChatId) return;

    const message = `
✅ **BUYURTMA QABUL QILINDI**

📋 **Buyurtma #${order.orderNumber}**
💰 **Jami summa:** $${order.totalAmount}
📅 **Sana:** ${new Date().toLocaleDateString()}

⏳ Buyurtmangiz ko'rib chiqilmoqda va ombor holati tekshirilmoqda...

📞 Savollar uchun: /help
    `;

    try {
      await customerBot.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Mijozga xabar yuborishda xatolik:', error);
    }
  }

  static async notifyProductionBot(productionOrder: any, item: any) {
    const productionBot = botManager.getBot('production');
    if (!productionBot) return;

    const adminChatIds = process.env.TELEGRAM_ADMIN_CHAT_ID?.split(',') || [];
    
    // Mahsulot ma'lumotlarini olish
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });
    
    const message = `
🏭 **YANGI ISHLAB CHIQARISH BUYURTMASI**

📦 **Mahsulot:** ${product?.name || 'Noma\'lum'}
📊 **Miqdor:** ${productionOrder.targetQuantity} qop
📅 **Boshlanish:** ${new Date(productionOrder.plannedDate).toLocaleDateString()}
📝 **Izoh:** ${productionOrder.notes}

⚡ Ishlab chiqarishni boshlang!
    `;

    for (const chatId of adminChatIds) {
      if (chatId.trim()) {
        try {
          await productionBot.sendMessage(chatId.trim(), message, { parse_mode: 'Markdown' });
        } catch (error) {
          console.error('Production botga xabar yuborishda xatolik:', error);
        }
      }
    }
  }

  static async notifyLogisticsBot(order: any, items: any[]) {
    const logisticsBot = botManager.getBot('logistics');
    if (!logisticsBot) return;

    const adminChatIds = process.env.TELEGRAM_ADMIN_CHAT_ID?.split(',') || [];
    
    const message = `
🚚 **YANGI YETKAZIB BERISH BUYURTMASI**

👤 **Mijoz:** ${order.customer.name}
📋 **Buyurtma:** #${order.orderNumber}
📍 **Manzil:** ${order.customer.address || 'Manzil kiritilmagan'}
📅 **Rejalashtirilgan:** Ertaga
📦 **Mahsulotlar:** ${items.length} ta

🚛 Yetkazib berishni rejalashtiring!
    `;

    for (const chatId of adminChatIds) {
      if (chatId.trim()) {
        try {
          await logisticsBot.sendMessage(chatId.trim(), message, { parse_mode: 'Markdown' });
        } catch (error) {
          console.error('Logistics botga xabar yuborishda xatolik:', error);
        }
      }
    }
  }

  static async notifyAdminNewOrder(order: any, items: any[]) {
    const adminBot = botManager.getBot('admin');
    if (!adminBot) return;

    const adminChatIds = process.env.TELEGRAM_ADMIN_CHAT_ID?.split(',') || [];
    
    const inStockCount = items.filter(item => item.stockStatus.available).length;
    const outOfStockCount = items.filter(item => !item.stockStatus.available).length;

    const message = `
📋 **YANGI BUYURTMA**

👤 **Mijoz:** ${order.customer.name}
📋 **Buyurtma:** #${order.orderNumber}
💰 **Summa:** $${order.totalAmount}

📊 **Ombor holati:**
✅ Mavjud: ${inStockCount} ta mahsulot
❌ Yo'q: ${outOfStockCount} ta mahsulot

${outOfStockCount > 0 ? '🏭 Ishlab chiqarishga yuborildi' : '🚚 Yetkazib berishga tayyor'}
    `;

    for (const chatId of adminChatIds) {
      if (chatId.trim()) {
        try {
          await adminBot.sendMessage(chatId.trim(), message, { parse_mode: 'Markdown' });
        } catch (error) {
          console.error('Admin botga xabar yuborishda xatolik:', error);
        }
      }
    }
  }

  static async notifyCustomerProductionCompleted(telegramChatId: string, order: any, production: any) {
    const customerBot = botManager.getBot('customer') || botManager.getBot('customer-premium');
    if (!customerBot || !telegramChatId) return;

    const message = `
🏭 **ISHLAB CHIQARISH TUGADI**

📋 **Buyurtma #${order.orderNumber}**
📦 **Mahsulot:** ${production.product.name}
✅ **Holat:** Tayyor

🚚 Mahsulotingiz yetkazib berish uchun tayyorlanmoqda...
📅 Taxminiy yetkazib berish: Ertaga

📞 Savollar uchun: /help
    `;

    try {
      await customerBot.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Mijozga ishlab chiqarish xabari yuborishda xatolik:', error);
    }
  }

  static async notifyCustomerDeliveryCompleted(telegramChatId: string, order: any) {
    const customerBot = botManager.getBot('customer') || botManager.getBot('customer-premium');
    if (!customerBot || !telegramChatId) return;

    const message = `
🎉 **BUYURTMA YETKAZILDI**

📋 **Buyurtma #${order.orderNumber}**
📅 **Yetkazilgan sana:** ${new Date().toLocaleDateString()}
💰 **Summa:** ${order.totalAmount}

✅ Buyurtmangiz muvaffaqiyatli yetkazildi!

⭐ Xizmatimizni baholang: /feedback
🛒 Yangi buyurtma: /order
    `;

    try {
      await customerBot.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Mijozga yetkazib berish xabari yuborishda xatolik:', error);
    }
  }

  static async notifyAdminDeliveryCompleted(delivery: any) {
    const adminBot = botManager.getBot('admin');
    if (!adminBot) return;

    const adminChatIds = process.env.TELEGRAM_ADMIN_CHAT_ID?.split(',') || [];
    
    const message = `
✅ **YETKAZIB BERISH TUGADI**

👤 **Mijoz:** ${delivery.order.customer.name}
📋 **Buyurtma:** #${delivery.order.orderNumber}
📅 **Yetkazilgan:** ${new Date().toLocaleDateString()}

💰 **Daromad:** $${delivery.order.totalAmount}
📊 **Holat:** Tugallandi
    `;

    for (const chatId of adminChatIds) {
      if (chatId.trim()) {
        try {
          await adminBot.sendMessage(chatId.trim(), message, { parse_mode: 'Markdown' });
        } catch (error) {
          console.error('Admin botga yetkazib berish xabari yuborishda xatolik:', error);
        }
      }
    }
  }

  // Haydovchiga buyurtma tayinlash xabari
  static async notifyDriverNewAssignment(driver: any, order: any, assignment: any) {
    console.log(`🚚 Haydovchiga yangi buyurtma tayinlandi: ${driver.name} - ${order.orderNumber}`);
    
    // Bu yerda haydovchi botiga xabar yuborish logikasi bo'ladi
    // DriverBotManager orqali xabar yuborish
    try {
      const { DriverBotManager } = await import('../bot/driver-bot');
      await DriverBotManager.assignOrderToDriver(order.id, driver.id, 'system');
    } catch (error) {
      console.error('Haydovchiga xabar yuborishda xatolik:', error);
    }
  }

  // Mijozga haydovchi ma'lumotlarini yuborish
  static async notifyCustomerDriverAssigned(order: any, driver: any, assignment: any) {
    const customerBot = botManager.getBot('customer') || botManager.getBot('customer-premium');
    if (!customerBot || !order.customer.telegramChatId) return;

    const message = `
🚚 **HAYDOVCHI TAYINLANDI**

📋 **Buyurtma:** #${order.orderNumber}
👤 **Haydovchi:** ${driver.name}
📞 **Telefon:** ${driver.phone}
📱 **Telegram:** ${driver.telegramUsername ? '@' + driver.telegramUsername : 'Mavjud emas'}

📍 **Yetkazib berish manzili:** ${assignment.deliveryAddress}
⏰ **Taxminiy vaqt:** ${assignment.estimatedTime || 60} daqiqa

🚛 Haydovchi tez orada siz bilan bog'lanadi va buyurtmangizni yetkazib beradi.

📞 Savollar uchun haydovchi bilan to'g'ridan-to'g'ri bog'laning: ${driver.phone}
    `;

    try {
      await customerBot.sendMessage(order.customer.telegramChatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📞 Haydovchi bilan bog\'lanish', url: `tel:${driver.phone}` }],
            [{ text: '📍 Buyurtma holatini kuzatish', callback_data: `track_order_${order.id}` }]
          ]
        }
      });
    } catch (error) {
      console.error('Mijozga haydovchi ma\'lumotlari yuborishda xatolik:', error);
    }
  }
}