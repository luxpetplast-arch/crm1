import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { sendEnhancedPaymentConfirmation } from '../bot/enhanced-bot';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { category, hasDebt, search } = req.query;
    
    let where: any = {};
    
    // Kategoriya filtri
    if (category) {
      where.category = category as string;
    }
    
    // Qarzli mijozlar filtri
    if (hasDebt === 'true') {
      where.debt = { gt: 0 };
    }
    
    const customers = await prisma.customer.findMany({
      where,
      include: { _count: { select: { sales: true } } },
    });
    
    // Qidirish - SQLite uchun JavaScript'da filtrlash
    if (search) {
      const searchLower = (search as string).toLowerCase();
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        (c.phone && c.phone.includes(search as string)) ||
        (c.email && c.email.toLowerCase().includes(searchLower))
      );
      return res.json(filtered);
    }
    
    res.json(customers);
  } catch (error) {
    console.error('❌ GET /customers xatolik:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { telegramId, ...customerData } = req.body;
    
    // Agar Telegram ID kiritilgan bo'lsa va bo'sh bo'lmasa, uni tekshirish va bog'lash
    if (telegramId && telegramId.trim()) {
      // Telegram ID orqali mijozni topish (ID ning oxirgi 8 belgisi)
      const existingCustomers = await prisma.customer.findMany({
        where: {
          telegramChatId: { not: null }
        }
      });
      
      // ID ning oxirgi 8 belgisini solishtirish
      const matchedCustomer = existingCustomers.find(c => 
        c.id.slice(-8).toUpperCase() === telegramId.toUpperCase().trim()
      );
      
      if (!matchedCustomer) {
        return res.status(404).json({ 
          error: 'Telegram ID topilmadi. Iltimos, botdan /start yuboring va ID ni qayta oling.' 
        });
      }
      
      // Agar mijoz allaqachon saytda ro'yxatdan o'tgan bo'lsa
      if (matchedCustomer.name !== 'Telegram User' && matchedCustomer.phone !== `@${matchedCustomer.telegramUsername}`) {
        return res.status(400).json({ 
          error: 'Bu Telegram ID allaqachon boshqa mijozga bog\'langan.' 
        });
      }
      
      // Mavjud Telegram mijozni yangilash
      const customer = await prisma.customer.update({
        where: { id: matchedCustomer.id },
        data: {
          ...customerData,
          telegramChatId: matchedCustomer.telegramChatId,
          telegramUsername: matchedCustomer.telegramUsername
        }
      });
      
      return res.json(customer);
    }
    
    // Oddiy mijoz yaratish (Telegram ID siz)
    const customer = await prisma.customer.create({ data: customerData });
    res.json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        sales: { include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, currency, description, paymentDetails } = req.body;
    const customerId = req.params.id;
    
    // Mijozni tekshirish
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Mijoz topilmadi' });
    }

    // Transaction ichida barcha operatsiyalarni bajarish
    const result = await prisma.$transaction(async (tx) => {
      // 1. To'lovni yaratish
      const payment = await tx.payment.create({
        data: { 
          customerId, 
          amount, 
          currency: currency || 'USD', 
          description: description || 'Qarz to\'lovi',
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null
        },
      });

      // 2. Mijoz qarzini kamaytirish
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { 
          debt: { decrement: amount },
          balance: { increment: amount },
          lastPayment: new Date(),
        },
      });

      // 3. Kassaga qo'shish
      await (tx as any).cashboxTransaction.create({
        data: {
          type: 'INCOME',
          amount,
          category: 'PAYMENT',
          description: `Qarz to'lovi - ${customer.name}`,
          userId: (req as any).user.id,
          userName: (req as any).user.name || (req as any).user.email,
          reference: payment.id
        }
      });

      return { payment, updatedCustomer };
    });

    // Telegram orqali tasdiqlash yuborish
    try {
      await sendEnhancedPaymentConfirmation(result.updatedCustomer, result.payment);
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
      // Telegram xatosi asosiy operatsiyani to'xtatmasin
    }

    res.json(result.payment);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'To\'lovni qayd qilishda xatolik' });
  }
});

router.get('/alerts/overdue', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { lastPayment: { lt: thirtyDaysAgo }, debt: { gt: 0 } },
          { lastPurchase: { lt: thirtyDaysAgo } },
        ],
      },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PUT /customers/:id - Mijozni yangilash
router.put('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(customer);
  } catch (error: any) {
    console.error('❌ PUT /customers/:id xatolik:', error.message);
    res.status(500).json({ 
      error: 'Failed to update customer',
      details: error.message 
    });
  }
});

// DELETE /customers/:id - Mijozni o'chirish
router.delete('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Transaction ichida barcha operatsiyalarni bajarish
    await prisma.$transaction(async (tx) => {
      // 1. Avval bog'liq yozuvlarni o'chirish (to'g'ri tartibda)
      
      // CustomerChat xabarlarini o'chirish
      await tx.customerChat.deleteMany({
        where: { customerId }
      });
      
      // OrderItem larni o'chirish (Order lar bilan birga)
      await tx.orderItem.deleteMany({
        where: {
          order: {
            customerId
          }
        }
      });
      
      // Order larni o'chirish
      await tx.order.deleteMany({
        where: { customerId }
      });
      
      // SaleItem larni o'chirish (Sale lar bilan birga)
      await tx.saleItem.deleteMany({
        where: {
          sale: {
            customerId
          }
        }
      });
      
      // Invoice larni o'chirish
      await tx.invoice.deleteMany({
        where: { customerId }
      });
      
      // Sale larni o'chirish
      await tx.sale.deleteMany({
        where: { customerId }
      });
      
      // Payment larni o'chirish
      await tx.payment.deleteMany({
        where: { customerId }
      });
      
      // Contract larni o'chirish
      await tx.contract.deleteMany({
        where: { customerId }
      });
      
      // 2. Oxirida mijozni o'chirish
      await tx.customer.delete({
        where: { id: customerId }
      });
    });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('❌ DELETE /customers/:id xatolik:', error);
    res.status(500).json({ 
      error: 'Failed to delete customer',
      details: error.message 
    });
  }
});

// POST /customers/:id/apply-discount-template - Chegirma shablonini boshqa mahsulotlarga qo'llash
router.post('/:id/apply-discount-template', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { discount } = req.body; // Chegirma miqdori (masalan: -5 yoki +10)
    
    if (!discount || isNaN(discount)) {
      return res.status(400).json({ error: 'Invalid discount value' });
    }
    
    console.log(`🎁 Mijoz ${customerId} uchun chegirma shabloni qo'llanmoqda: ${discount} UZS`);
    
    // Mijozni olish
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Barcha mahsulotlarni olish
    const products = await prisma.product.findMany();
    
    // Hozirgi narxlarni olish
    let productPrices: Record<string, number> = {};
    const customerData = customer as any;
    if (customerData.productPrices) {
      try {
        productPrices = typeof customerData.productPrices === 'string' 
          ? JSON.parse(customerData.productPrices) 
          : customerData.productPrices;
      } catch (e) {
        console.error('Error parsing productPrices:', e);
      }
    }
    
    // Har bir mahsulot uchun chegirma qo'llash
    let appliedCount = 0;
    products.forEach(product => {
      if (product.pricePerBag) {
        const newPrice = Math.max(0, product.pricePerBag - discount);
        productPrices[product.id] = newPrice;
        appliedCount++;
        console.log(`  ✅ ${product.name}: ${product.pricePerBag} → ${newPrice} UZS`);
      }
    });
    
    // Yangilangan narxlarni saqlash
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        productPrices: JSON.stringify(productPrices)
      } as any
    });
    
    console.log(`✅ ${appliedCount} ta mahsulot uchun chegirma qo'llandi`);
    
    res.json({
      success: true,
      appliedCount,
      customer: updatedCustomer
    });
  } catch (error: any) {
    console.error('❌ Chegirma shablonini qo\'llashda xatolik:', error.message);
    res.status(500).json({ 
      error: 'Failed to apply discount template',
      details: error.message 
    });
  }
});

export default router;
