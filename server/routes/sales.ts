import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { notifyCustomerSale, notifyLowStock } from '../utils/telegram-notifications';
import { createInvoiceForSale } from '../utils/invoice-generator';
import { logger } from '../utils/logger';

const router = Router();

// Exchange rate - should come from environment or settings
const exchangeRates = {
  USD_TO_UZS: parseInt(process.env.EXCHANGE_RATE_USD_TO_UZS || '12500', 10)
};

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    
    let sales;
    
    if (productId) {
      // Agar productId berilgan bo'lsa, faqat shu mahsulot sotuvlarini qaytarish
      sales = await prisma.sale.findMany({
        where: {
          items: {
            some: {
              productId: productId as string
            }
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Barcha sotuvlar
      sales = await prisma.sale.findMany({
        include: {
          customer: true,
          driver: true,
          product: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    res.json(sales);
  } catch (error: any) {
    console.error('❌ GET /sales xatolik:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch sales', details: error.message });
  }
});

// Get single sale by ID   
router.get('/:id', async (req, res) => {
  try {       
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        driver: true,
        product: true,
        items: {
          include: {
            product: true
          }
        },
        invoice: true
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Get sale by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

router.post('/', authorize('ADMIN', 'CASHIER', 'SELLER'), async (req: AuthRequest, res) => {
  try {
    const { customerId, items, totalAmount, paidAmount, currency, paymentCurrency, paymentStatus, paymentDetails, driverId, factoryShare, customerShare, isKocha, manualCustomerName, manualCustomerPhone } = req.body;

    logger.info({
      customerId,
      isKocha,
      itemsCount: items?.length,
      totalAmount,
      currency
    }, 'Sotuv yaratish boshlandi');

    if (!customerId && !isKocha) {
      logger.warn('Sotuv yaratish: Mijoz tanlanmagan');
      return res.status(400).json({ error: 'Mijoz tanlanmagan' });
    }

    // USER tekshirish
    const userId = req.user?.id;
    if (!userId) {
      logger.error('Sotuv yaratish: Foydalanuvchi aniqlanmadi');
      return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.warn('Sotuv yaratish: Mahsulotlar ro\'yxati bo\'sh');
      return res.status(400).json({ error: 'Kamida bitta mahsulot tanlash kerak' });
    }

    logger.debug({ items: items.length }, 'Mahsulotlar tekshirilmoqda');

    // 1. ВАЛИДАЦИЯ
    const validationResults = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.productId) {
        logger.warn({ itemIndex: i }, 'Item da mahsulot tanlanmagan');
        return res.status(400).json({ error: `Item ${i + 1} da mahsulot tanlanmagan` });
      }
      
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        logger.error({ productId: item.productId }, 'Mahsulot topilmadi');
        return res.status(404).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      }

      logger.debug({ product: product.name, stock: product.currentStock }, 'Mahsulot topildi');

      const requestedQty = parseFloat(item.quantity) || 0;
      if (requestedQty <= 0) {
        logger.warn({ product: product.name, quantity: requestedQty }, 'Miqdor xato');
        return res.status(400).json({ error: `${product.name} miqdori xato` });
      }

      // Dona savdo tekshiruvi
      const isPieceSale = item.saleType === 'piece';
      const availableStock = isPieceSale ? product.currentUnits : product.currentStock;
      const stockField = isPieceSale ? 'currentUnits' : 'currentStock';
      const unitLabel = isPieceSale ? 'dona' : 'qop';

      console.log(`📊 Ombor tekshiruvi:`, {
        productName: product.name,
        saleType: item.saleType,
        isPieceSale,
        requestedQty,
        availableStock,
        stockField,
        unitLabel
      });

      if (availableStock < requestedQty) {
        console.error(`❌ Omborda yetarli mahsulot yo'q:`, {
          product: product.name,
          available: availableStock,
          requested: requestedQty,
          unit: unitLabel
        });
        return res.status(400).json({ 
          error: `${product.name} uchun omborda yetarli mahsulot yo'q (${unitLabel} yetarli emas)`,
          available: availableStock,
          requested: requestedQty,
          unit: unitLabel
        });
      }

      const price = parseFloat(item.pricePerBag || item.pricePerPiece || 0);
      const subtotal = requestedQty * price;
      
      console.log(`✅ Item ${i + 1} validatsiyadan o'tdi:`, {
        product: product.name,
        quantity: requestedQty,
        price,
        subtotal,
        saleType: item.saleType || 'bag'
      });
      
      validationResults.push({ product, item, subtotal, saleType: item.saleType || 'bag' });
    }

    console.log('✅ Barcha mahsulotlar validatsiyadan o\'tdi');

    // 2. СОТУВ ЯРАТИШ
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    
    // UZS da to'lov summasini hisoblash
    const paidUZS = parseFloat(paymentDetails?.uzs) || 0;
    const paidUSD = parseFloat(paymentDetails?.usd) || 0;
    const paidCLICK = parseFloat(paymentDetails?.click) || 0;
    const totalPaidUZS = paidUZS + paidCLICK + (paidUSD * exchangeRates.USD_TO_UZS);
    
    console.log('💰 To\'lov hisob-kitobi:', {
      paidUZS,
      paidUSD,
      paidCLICK,
      totalPaidUZS,
      paidAmount,
      currency
    });
    
    // USER va CUSTOMER mavjudligini tekshirish
    console.log('🔍 User va Customer tekshirilmoqda...');
    console.log('userId:', userId);
    console.log('customerId:', customerId);
    console.log('isKocha:', isKocha);
    
    // User mavjudligini tekshirish
    let userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.warn('⚠️ User topilmadi, yangi user yaratilmoqda:', userId);
      
      // Yangi user yaratish (tezkor yechim)
      try {
        // Hashed password yaratish (bcrypt bilan)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('temporary_password_123', 10);
        
        userExists = await prisma.user.create({
          data: {
            id: userId,
            login: `cashier_${userId.slice(0, 8)}`,
            name: 'Kassir',
            role: 'CASHIER',
            password: hashedPassword
          }
        });
        console.log('✅ Yangi user yaratildi:', userExists.login);
      } catch (createError: any) {
        console.error('❌ User yaratishda xatolik:', createError);
        console.error('❌ Xatolik ma\'lumotlari:', createError.message);
        return res.status(400).json({ 
          error: 'Foydalanuvchi topilmadi va yaratib bo\'lmadi',
          details: `User ID: ${userId} bazada mavjud emas. Iltimos, qaytadan login qiling.`
        });
      }
    }
    console.log('✅ User topildi:', userExists.login);
    
    // Customer mavjudligini tekshirish (agar Ko'chaga bo'lmasa)
    if (!isKocha && customerId) {
      let customerExists = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customerExists) {
        console.warn('⚠️ Customer topilmadi, yangi customer yaratilmoqda:', customerId);
        
        // Yangi customer yaratish (tezkor yechim)
        try {
          customerExists = await prisma.customer.create({
            data: {
              id: customerId,
              name: `Mijoz ${customerId.slice(0, 8)}`,
              phone: '+998900000000',
              address: 'Manzil kiritilmagan',
              balanceUZS: 0,
              balanceUSD: 0,
              debtUZS: 0,
              debtUSD: 0
            }
          });
          console.log('✅ Yangi customer yaratildi:', customerExists.name);
        } catch (createError) {
          console.error('❌ Customer yaratishda xatolik:', createError);
          return res.status(400).json({ 
            error: 'Mijoz topilmadi va yaratib bo\'lmadi',
            details: `Customer ID: ${customerId} bazada mavjud emas. Iltimos, mijozni qaytadan tanlang.`
          });
        }
      }
      console.log('✅ Customer topildi:', customerExists.name);
    }
    
    // Ketma-ket chek raqamini olish
    const lastSale = await prisma.sale.findFirst({
      orderBy: { receiptNumber: 'desc' },
      select: { receiptNumber: true }
    });
    const nextReceiptNumber = (lastSale?.receiptNumber || 0) + 1;
    console.log('🎫 Yangi chek raqami:', nextReceiptNumber);
    
    const saleData = {
      receiptNumber: nextReceiptNumber,
      customerId: isKocha ? null : customerId,
      productId: null, // Multi-product sale uchun null
      userId: userId,
      driverId: driverId || null,
      quantity: totalQty,
      pricePerBag: 0,
      totalAmount: parseFloat(totalAmount) || 0,
      paidAmount: currency === 'UZS' ? totalPaidUZS : parseFloat(paidAmount) || 0,
      currency: currency || 'USD',
      paymentStatus: paymentStatus || 'UNPAID',
      paymentDetails: paymentDetails ? (typeof paymentDetails === 'string' ? paymentDetails : JSON.stringify(paymentDetails)) : null,
      factoryShare: parseFloat(factoryShare) || 0,
      customerShare: parseFloat(customerShare) || 0,
      isKocha: !!isKocha,
      manualCustomerName: manualCustomerName || null,
      manualCustomerPhone: manualCustomerPhone || null,
    };
    
    console.log('📝 Sotuv yaratilmoqda:', JSON.stringify(saleData, null, 2));
    
    let sale = null;
    try {
      sale = await prisma.sale.create({
        data: saleData,
        include: {
          customer: true,
        },
      });

      console.log('✅ Sotuv yaratildi:', sale.id);
    } catch (createError: any) {
      console.error('❌ Sotuv yaratishda Prisma xatosi:', createError);
      console.error('❌ Xatolik kodi:', createError.code);
      console.error('❌ Xatolik xabari:', createError.message);
      console.error('❌ Meta ma\'lumotlar:', createError.meta);
      
      return res.status(500).json({
        error: 'Sotuv yaratishda xatolik',
        details: createError.message,
        code: createError.code,
        meta: createError.meta
      });
    }

    // 3. SALE ITEMS ЯРАТИШ
    const saleItems = [];
    for (const validation of validationResults) {
      const saleItemData: any = {
        saleId: sale.id,
        productId: validation.item.productId,
        quantity: parseFloat(validation.item.quantity),
        pricePerBag: parseFloat(validation.item.pricePerBag || validation.item.pricePerPiece || 0),
        subtotal: validation.subtotal,
        saleType: validation.item.saleType || 'bag'
      };
      
      // Agar variantId bo'lsa, saqlash
      if (validation.item.variantId) {
        saleItemData.variantId = validation.item.variantId;
      }
      
      const saleItem = await prisma.saleItem.create({
        data: saleItemData,
        include: {
          product: true
        }
      });
      saleItems.push(saleItem);
    }

    // АВТОМАТЛАШТИРИШ FLAGS
    let stockUpdated = false;
    let cashboxUpdated = false;
    let invoiceCreated = false;
    let notificationSent = false;
    let lowStockAlert = false;

    try {
      // 4. HAR BIR MAHSULOT UCHUN OMBOR AVTOMATIK KAMAYTIRISH
      for (const validation of validationResults) {
        const { product, item } = validation;
        const quantity = parseFloat(item.quantity);
        
        // Frontenddan kelgan unitsPerBag ishlatish (to'g'ri qiymat uchun)
        const unitsPerBag = parseFloat(item.unitsPerBag) || product.unitsPerBag || 2000;
        
        console.log(`🔧 OMBOR KAMAYTIRISH:`, {
          product: product.name,
          quantity,
          unitsPerBag,
          saleType: item.saleType,
          productUnitsPerBag: product.unitsPerBag,
          itemUnitsPerBag: item.unitsPerBag
        });
        
        // Dona savdo uchun ombor kamaytirish
        const isPieceSale = item.saleType === 'piece';
        let bagsToDeduct = quantity;
        let unitsToDeduct = quantity * unitsPerBag;
        
        if (isPieceSale) {
          // Dona savdo: quantity allaqachon dona, qopga aylantirish
          bagsToDeduct = quantity / unitsPerBag;
          unitsToDeduct = quantity;
        }
        
        const newStock = product.currentStock - bagsToDeduct;
        const newUnits = product.currentUnits - unitsToDeduct;
        
        console.log(`📊 ${product.name} hisoblash:`, {
          currentStock: product.currentStock,
          bagsToDeduct,
          newStock,
          currentUnits: product.currentUnits,
          unitsToDeduct,
          newUnits
        });
        
        // Asosiy mahsulot omborini yangilash
        await prisma.product.update({
          where: { id: product.id },
          data: {
            currentStock: newStock,
            currentUnits: newUnits
          }
        });
        
        // AGAR VARIANT BO'LSA - variant omborini ham yangilash
        if (item.variantId) {
          try {
            await prisma.$queryRaw`
              UPDATE ProductVariant 
              SET currentStock = currentStock - ${bagsToDeduct},
                  currentUnits = currentUnits - ${unitsToDeduct}
              WHERE id = ${item.variantId}
            `;
            console.log(`✅ Variant ${item.variantId} ombori yangilandi: -${bagsToDeduct} qop, -${unitsToDeduct} dona`);
          } catch (variantError) {
            console.log(`⚠️ Variant omborini yangilashda xatolik:`, variantError);
          }
        }

        console.log(`✅ ${product.name} stock yangilandi: ${product.currentStock} → ${newStock}`);

        // 5. STOCK MOVEMENT ЯРАТИШ
        try {
          let bagsChange = -quantity;
          let unitsChange = -quantity * unitsPerBag;
          
          if (isPieceSale) {
            bagsChange = -(quantity / unitsPerBag);
            unitsChange = -quantity;
          }
        
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: bagsChange,
            units: unitsChange,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: newStock,
            newUnits: newUnits,
            userId: userId,
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Multi-Sotuv: ${sale.id}`,
            notes: `Mijoz: ${sale.isKocha ? sale.manualCustomerName || 'Ko\'cha' : sale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}, Tip: ${isPieceSale ? 'dona' : 'qop'}`
          }
        });
      } catch (error) {
        console.log(`⚠️ ${product.name} StockMovement yaratilmadi:`, error);
      }

        // 6. LOW STOCK ALERT
        if (newStock <= product.minStockLimit) {
          try {
            await notifyLowStock(product.id);
            lowStockAlert = true;
            console.log(`⚠️ ${product.name} uchun low stock alert yuborildi (qop: ${newStock})`);
          } catch (error) {
            console.log(`⚠️ ${product.name} low stock alert xatolik:`, error);
          }
        }
      }
      stockUpdated = true;

      // 7. KASSA TRANZAKSIYASI YARATISH - Har bir valyuta uchun alohida
      if (paymentDetails) {
        try {
          const details = typeof paymentDetails === 'string' ? JSON.parse(paymentDetails) : paymentDetails;
          
          // UZS (Naqd)
          if (details.uzs && details.uzs > 0) {
            await prisma.cashboxTransaction.create({
              data: {
                type: 'INCOME',
                amount: details.uzs,
                category: 'SALE',
                description: `Sotuv (Naqd UZS): ${saleItems.map(item => item.product ? item.product.name : 'Noma\'lum').join(', ')}`,
                userId: userId,
                userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
              }
            });
            console.log(`✅ Kassa (UZS): ${details.uzs} so'm`);
          }
          
          // USD (Dollar)
          if (details.usd && details.usd > 0) {
            await prisma.cashboxTransaction.create({
              data: {
                type: 'INCOME',
amount: details.usd,
                category: 'SALE',
                description: `Sotuv (Dollar USD): ${saleItems.map(item => item.product?.name || 'Noma\'lum').join(', ')}`,
                userId: userId,
                userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
              }
            });
            console.log(`✅ Kassa (USD): $${details.usd}`);
          }
          
          // CLICK
          if (details.click && details.click > 0) {
            await prisma.cashboxTransaction.create({
              data: {
                type: 'INCOME',
                amount: details.click,
                category: 'SALE',
                description: `Sotuv (Click UZS): ${saleItems.map(item => item.product?.name || 'Noma\'lum').join(', ')}`,
                userId: userId,
                userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
              }
            });
            console.log(`✅ Kassa (Click): ${details.click} so'm`);
          }
          
          cashboxUpdated = true;
        } catch (error) {
          console.log(`⚠️ Kassa tranzaksiyasi xatolik:`, error);
        }
      }

      // 8. INVOICE ЯРАТИШ
      try {
        const invoice = await createInvoiceForSale(sale.id);
        if (invoice) {
          invoiceCreated = true;
          console.log(`✅ Invoice яратилди: ${invoice.invoiceNumber}`);
        }
      } catch (error) {
        console.log(`⚠️ Invoice yaratish xatolik:`, error);
      }

      // 9. TELEGRAM BILDIRISHNOMA
      try {
        await notifyCustomerSale(sale.id);
        notificationSent = true;
        console.log(`✅ Telegram bildirishnoma yuborildi`);
      } catch (error) {
        console.log(`⚠️ Telegram bildirishnoma xatolik:`, error);
      }

      // 10. MIJOZ QARZ VA BALANS YANGILASH (faqat isKocha bo'lmasa)
      if (!isKocha && customerId) {
        const debtAmount = parseFloat(totalAmount) - parseFloat(paidAmount);
        // SOTUV VALYUTASIGA QARAB QARZ QO'SHISH - paymentCurrency emas, currency ishlatamiz
        const saleCurrency = currency || 'USD';
        
        console.log(`Balance update - totalAmount: ${totalAmount}, paidAmount: ${paidAmount}, debtAmount: ${debtAmount}, saleCurrency: ${saleCurrency}`);
        
        if (debtAmount > 0) {
          // Mijoz kam to'lagan - qarz qo'shish (faqat sotuv valyutasida)
          try {
            if (saleCurrency === 'UZS') {
              // So'mda qarz qo'shish
              await prisma.customer.update({
                where: { id: customerId },
                data: {
                  debtUZS: {
                    increment: debtAmount
                  },
                  lastPurchase: new Date()
                }
              });
              console.log(`Mijoz qarz yangilandi (UZS): +${debtAmount}`);
            } else {
              // Dollarda qarz qo'shish
              await prisma.customer.update({
                where: { id: customerId },
                data: {
                  debtUSD: {
                    increment: debtAmount
                  },
                  lastPurchase: new Date()
                }
              });
              console.log(`Mijoz qarz yangilandi (USD): +${debtAmount}`);
            }
          } catch (error) {
            console.log(`Mijoz qarz yangilanmadi:`, error);
          }
        } else {
          // Mijoz to'lagan yoki ortiqcha to'lagan - balansga qo'shish (faqat sotuv valyutasida)
          const paymentAmount = parseFloat(paidAmount) || 0;
          if (paymentAmount > 0) {
            try {
              if (saleCurrency === 'UZS') {
                await prisma.customer.update({
                  where: { id: customerId },
                  data: {
                    balanceUZS: {
                      increment: paymentAmount
                    },
                    lastPurchase: new Date()
                  }
                });
                console.log(`Mijoz balansiga qo'shildi (UZS): +${paymentAmount}`);
              } else {
                await prisma.customer.update({
                  where: { id: customerId },
                  data: {
                    balanceUSD: {
                      increment: paymentAmount
                    },
                    lastPurchase: new Date()
                  }
                });
                console.log(`Mijoz balansiga qo'shildi (USD): +${paymentAmount}`);
              }
            } catch (error) {
              console.log(`Mijoz balansi yangilanmadi:`, error);
            }
          }
        }
      } else {
        console.log('Ko\'chaga sotuv - mijoz qarz/balans yangilanmadi');
      }

      // 11. AUDIT LOG
      try {
        await prisma.auditLog.create({
// ...
          data: {
            userId: req.user?.id || 'unknown',
            action: 'CREATE_MULTI_SALE',
            entity: 'Sale',
            entityId: sale.id,
            changes: JSON.stringify({
              customerId,
              items: saleItems.map(item => ({
                productName: item.product?.name || 'Noma\'lum mahsulot',
                quantity: item.quantity,
                subtotal: item.subtotal
              })),
              totalAmount: parseFloat(totalAmount),
              paidAmount: parseFloat(paidAmount)
            })
          }
        });
        console.log(`✅ Audit log yaratildi`);
      } catch (error) {
        console.log(`⚠️ Audit log xatolik:`, error);
      }

    } catch (error) {
      console.error('❌ Avtomatlashtirish xatolik:', error);
    }

    // Response with automation status and Ko'chaga info
    const debtAmount = parseFloat(totalAmount) - parseFloat(paidAmount);
    
    const response = {
      ...sale,
      items: saleItems,
      debtAmount: debtAmount > 0 ? debtAmount : 0,
      isKocha: isKocha || false,
      manualCustomerName: manualCustomerName || null,
      manualCustomerPhone: manualCustomerPhone || null,
      automationStatus: {
        stockDeducted: stockUpdated,
        cashboxUpdated: cashboxUpdated,
        invoiceGenerated: invoiceCreated,
        telegramSent: notificationSent,
        lowStockAlert: lowStockAlert
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Create multi-sale error:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.meta) console.error('Prisma meta:', error.meta);
    res.status(500).json({ 
      error: 'Сотув яратишда хатолик',
      details: error.message,
      stack: error.stack
    });
  }
});

// Update sale
router.put('/:id', authorize('ADMIN', 'CASHIER', 'SELLER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      items, 
      totalAmount, 
      paidAmount, 
      currency, 
      paymentCurrency,
      paymentStatus, 
      paymentDetails,
      isKocha,
      manualCustomerName,
      manualCustomerPhone,
      driverId,
      factoryShare,
      customerShare
    } = req.body;

    console.log('📥 PUT /sales - Data:', { id, customerId, isKocha, itemsCount: items?.length });

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
    }

    // Eski sotuvni olish
    const oldSale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    if (!oldSale) {
      return res.status(404).json({ error: 'Sotuv topilmadi' });
    }

    // 1. Eski mahsulotlarni omborda qaytarish (saleType ni hisobga olish)
    for (const oldItem of oldSale.items) {
      if (!oldItem.productId) continue;
      
      const oldProduct = await prisma.product.findUnique({ where: { id: oldItem.productId } });
      if (!oldProduct) continue;
      
      // Dona savdo bo'lsa, quantity ni dona hisoblaymiz
      const isPieceSale = (oldItem as any).saleType === 'piece';
      let bagsToReturn = oldItem.quantity;
      let unitsToReturn = oldItem.quantity * oldProduct.unitsPerBag;
      
      if (isPieceSale) {
        bagsToReturn = oldItem.quantity / oldProduct.unitsPerBag;
        unitsToReturn = oldItem.quantity;
      }
      
      await prisma.product.update({
        where: { id: oldItem.productId },
        data: {
          currentStock: { increment: bagsToReturn },
          currentUnits: { increment: unitsToReturn }
        }
      });
    }

    // 2. Yangi mahsulotlarni tekshirish
    const validationResults = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      }

      const requestedQty = parseFloat(item.quantity) || 0;
      
      // Dona savdo tekshiruvi
      const isPieceSale = item.saleType === 'piece';
      const availableStock = isPieceSale ? product.currentUnits : product.currentStock;
      const unitLabel = isPieceSale ? 'dona' : 'qop';
      
      if (availableStock < requestedQty) {
        return res.status(400).json({ 
          error: `${product.name} uchun omborda yetarli mahsulot yo'q (${unitLabel} yetarli emas)`,
          available: availableStock,
          requested: requestedQty,
          unit: unitLabel
        });
      }

      const price = parseFloat(item.pricePerBag || item.pricePerPiece || 0);
      validationResults.push({ product, item, subtotal: requestedQty * price });
    }

    // 3. Sotuvni yangilash
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        customerId: isKocha ? null : customerId,
        userId: userId,
        driverId: driverId || null,
        quantity: items.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity) || 0), 0),
        pricePerBag: 0,
        totalAmount: parseFloat(totalAmount) || 0,
        paidAmount: parseFloat(paidAmount) || 0,
        currency: currency || 'USD',
        paymentStatus: paymentStatus || 'UNPAID',
        paymentDetails: paymentDetails ? (typeof paymentDetails === 'string' ? paymentDetails : JSON.stringify(paymentDetails)) : null,
        factoryShare: parseFloat(factoryShare) || 0,
        customerShare: parseFloat(customerShare) || 0,
        isKocha: !!isKocha,
        manualCustomerName: manualCustomerName || null,
        manualCustomerPhone: manualCustomerPhone || null,
      },
      include: {
        customer: true,
      },
    });

    // 4. Eski sale items o'chirish
    await prisma.saleItem.deleteMany({
      where: { saleId: id }
    });

    // 5. Янги sale items яратиш
    const saleItems = [];
    for (const validation of validationResults) {
      const saleItem = await prisma.saleItem.create({
        data: {
          saleId: id,
          productId: validation.item.productId,
          quantity: parseFloat(validation.item.quantity),
          pricePerBag: parseFloat(validation.item.pricePerBag || validation.item.pricePerPiece || 0),
          subtotal: validation.subtotal
        },
        include: {
          product: true
        }
      });
      saleItems.push(saleItem);
    }

    // 6. Yangi mahsulotlarni ombordan kamaytirish
    for (const validation of validationResults) {
      const { product, item } = validation;
      const quantity = parseFloat(item.quantity);
      
      // Dona savdo uchun ombor kamaytirish
      const isPieceSale = item.saleType === 'piece';
      let bagsToDeduct = quantity;
      let unitsToDeduct = quantity * product.unitsPerBag;
      
      if (isPieceSale) {
        bagsToDeduct = quantity / product.unitsPerBag;
        unitsToDeduct = quantity;
      }
      
      const newStock = product.currentStock - bagsToDeduct;
      const newUnits = product.currentUnits - unitsToDeduct;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: newStock,
          currentUnits: newUnits
        }
      });

      console.log(`✅ ${product.name} stock yangilandi: ${product.currentStock} → ${newStock}`);

      // Stock movement яратиш
      try {
        const bagsChange = isPieceSale ? -(quantity / product.unitsPerBag) : -quantity;
        const unitsChange = isPieceSale ? -quantity : -(quantity * product.unitsPerBag);
        
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: bagsChange,
            units: unitsChange,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: newStock,
            newUnits: newUnits,
            userId: userId,
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Sotuv tahrirlandi: ${id}`,
            notes: `Mijoz: ${updatedSale.isKocha ? updatedSale.manualCustomerName || 'Ko\'cha' : updatedSale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}, Tip: ${isPieceSale ? 'dona' : 'qop'}`
          }
        });
      } catch (error) {
        console.log(`⚠️ ${product.name} StockMovement yaratilmadi:`, error);
      }
    }

    // 7. Mijoz qarz va balansni yangilash
    const oldDebt = oldSale.totalAmount - oldSale.paidAmount;
    const newDebt = parseFloat(totalAmount) - parseFloat(paidAmount);
    const debtDifference = newDebt - oldDebt;
    const saleCurrency = currency || 'USD';

    if (debtDifference !== 0 && customerId) {
      try {
        if (saleCurrency === 'UZS') {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              debtUZS: {
                increment: debtDifference
              }
            }
          });
          console.log(`✅ Mijoz qarz yangilandi (UZS): ${debtDifference > 0 ? '+' : ''}${debtDifference}`);
        } else {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              debtUSD: {
                increment: debtDifference
              }
            }
          });
          console.log(`✅ Mijoz qarz yangilandi (USD): ${debtDifference > 0 ? '+' : ''}${debtDifference}`);
        }
      } catch (error) {
        console.log(`⚠️ Mijoz qarz yangilanmadi:`, error);
      }
    } else if (debtDifference !== 0 && !customerId) {
      console.log(`ℹ️ Ko'cha savdosi uchun qarz yangilanmadi: ${debtDifference}`);
    }

    // 8. Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_SALE',
          entity: 'Sale',
          entityId: id,
          changes: JSON.stringify({
            old: {
              customerId: oldSale.customerId,
              totalAmount: oldSale.totalAmount,
              paidAmount: oldSale.paidAmount,
              items: oldSale.items.map(item => ({
                productName: item.product?.name || 'Noma\'lum mahsulot',
                quantity: item.quantity,
                subtotal: item.subtotal
              }))
            },
            new: {
              customerId,
              totalAmount: parseFloat(totalAmount),
              paidAmount: parseFloat(paidAmount),
              items: saleItems.map(item => ({
                productName: item.product?.name || 'Noma\'lum mahsulot',
                quantity: item.quantity,
                subtotal: item.subtotal
              }))
            }
          })
        }
      });
      console.log(`✅ Audit log yaratildi`);
    } catch (error) {
      console.log(`⚠️ Audit log xatolik:`, error);
    }

    res.json({
      ...updatedSale,
      items: saleItems
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Sotuvni tahrirlashda xatolik' });
  }
});

// Delete sale
router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log('🗑️ DELETE /sales - ID:', id);

    // 1. Sotuvni va uning mahsulotlarini olish
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sotuv topilmadi' });
    }

    // 2. Omborda mahsulotlarni qaytarish (saleType ni hisobga olish)
    for (const item of sale.items) {
      if (!item.productId) continue;
      
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      
      // Dona savdo bo'lsa, quantity ni dona hisoblaymiz
      const isPieceSale = (item as any).saleType === 'piece';
      let bagsToReturn = item.quantity;
      let unitsToReturn = item.quantity * product.unitsPerBag;
      
      if (isPieceSale) {
        bagsToReturn = item.quantity / product.unitsPerBag;
        unitsToReturn = item.quantity;
      }
      
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: { increment: bagsToReturn },
          currentUnits: { increment: unitsToReturn }
        }
      });

      // Stock movement yaratish
      try {
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE_CANCEL',
            quantity: bagsToReturn,
            units: unitsToReturn,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: product.currentStock + bagsToReturn,
            newUnits: product.currentUnits + unitsToReturn,
            userId: userId || 'system',
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Sotuv o'chirildi: ${id}`,
            notes: `Mijoz: ${sale.isKocha ? sale.manualCustomerName || 'Ko\'cha' : sale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}, Tip: ${isPieceSale ? 'dona' : 'qop'}`
          }
        });
      } catch (error) {
        console.log(`⚠️ ${product.name} StockMovement yaratilmadi:`, error);
      }
    }

    // 3. Mijoz qarzini kamaytirish
    const debtToReduce = sale.totalAmount - sale.paidAmount;
    if (debtToReduce !== 0 && sale.customerId) {
      try {
        if (sale.currency === 'UZS') {
          await prisma.customer.update({
            where: { id: sale.customerId },
            data: {
              debtUZS: {
                decrement: debtToReduce
              }
            }
          });
        } else {
          await prisma.customer.update({
            where: { id: sale.customerId },
            data: {
              debtUSD: {
                decrement: debtToReduce
              }
            }
          });
        }
        console.log(`✅ Mijoz qarzi kamaytirildi: -${debtToReduce} ${sale.currency}`);
      } catch (error) {
        console.log(`⚠️ Mijoz qarzi yangilanmadi:`, error);
      }
    }

    // 4. Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || 'system',
          action: 'DELETE_SALE',
          entity: 'Sale',
          entityId: id,
          changes: JSON.stringify({
            deletedSale: {
              id: sale.id,
              customerId: sale.customerId,
              totalAmount: sale.totalAmount,
              paidAmount: sale.paidAmount,
              items: sale.items.map(item => ({
                productName: item.product?.name || 'Noma\'lum mahsulot',
                quantity: item.quantity,
                subtotal: item.subtotal
              }))
            }
          })
        }
      });
    } catch (error) {
      console.log(`⚠️ Audit log xatolik:`, error);
    }

    // 5. Sotuvni o'chirish (saleItems cascade delete bo'lishi kerak, bo'lmasa deleteMany qilish kerak)
    // Prisma-da odatda onDelete: Cascade bo'ladi, lekin ishonch uchun:
    await prisma.saleItem.deleteMany({
      where: { saleId: id }
    });

    await prisma.sale.delete({
      where: { id }
    });

    res.json({ message: 'Sotuv muvaffaqiyatli o\'chirildi' });
  } catch (error: any) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Sotuvni o\'chirishda xatolik', details: error.message });
  }
});

export default router;

// ==================== AUDIT ENDPOINTS ====================

// Savdo tarixini olish
router.get('/audit/history', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userId, customerId, action, limit } = req.query;
    
    const { getSalesHistory } = await import('../utils/sales-audit');
    
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (userId) filters.userId = userId as string;
    if (customerId) filters.customerId = customerId as string;
    if (action) filters.action = action as string;
    if (limit) filters.limit = parseInt(limit as string);
    
    const history = await getSalesHistory(filters);
    res.json(history);
  } catch (error) {
    console.error('Get sales history error:', error);
    res.status(500).json({ error: 'Savdo tarixini olishda xatolik' });
  }
});

// Savdo statistikasini olish
router.get('/audit/stats', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const { getSalesAuditStats } = await import('../utils/sales-audit');
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const stats = await getSalesAuditStats(start, end);
    res.json(stats);
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ error: 'Savdo statistikasini olishda xatolik' });
  }
});

// Shubhali savdo faoliyatini aniqlash
router.get('/audit/suspicious-activity', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.query;
    
    const { detectSuspiciousSalesActivity } = await import('../utils/sales-audit');
    
    const suspicious = await detectSuspiciousSalesActivity(userId as string);
    res.json(suspicious);
  } catch (error) {
    console.error('Detect suspicious sales activity error:', error);
    res.status(500).json({ error: 'Shubhali faoliyatni aniqlashda xatolik' });
  }
});

// Savdo trendi
router.get('/audit/trend', async (req: AuthRequest, res) => {
  try {
    const { days } = req.query;
    
    const { getSalesTrend } = await import('../utils/sales-audit');
    
    const daysNum = days ? parseInt(days as string) : 30;
    const trend = await getSalesTrend(daysNum);
    res.json(trend);
  } catch (error) {
    console.error('Get sales trend error:', error);
    res.status(500).json({ error: 'Savdo trendini olishda xatolik' });
  }
});

// Mijoz savdo tarixini olish
router.get('/audit/customer/:customerId', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    
    const { getCustomerSalesHistory } = await import('../utils/sales-audit');
    
    const history = await getCustomerSalesHistory(customerId);
    res.json(history);
  } catch (error) {
    console.error('Get customer sales history error:', error);
    res.status(500).json({ error: 'Mijoz savdo tarixini olishda xatolik' });
  }
});

// ==================== HAYDOVCHI TO'LOV QABUL QILISH ====================

// Haydovchi to'lovini qabul qilish (sotuv uchun)
router.post('/:id/driver-collection', authorize('ADMIN', 'CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { collectedAmount, paymentMethod, notes } = req.body;
    
    if (collectedAmount === undefined || collectedAmount < 0) {
      return res.status(400).json({ error: 'Yig\'ilgan summa kiritilishi shart!' });
    }
    
    // Sotuvni topish
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Sotuv topilmadi' });
    }
    
    if (!sale.driverId) {
      return res.status(400).json({ error: 'Bu sotuvga haydovchi biriktirilmagan!' });
    }
    
    // Yangi yig'ilgan summa
    const newCollectedAmount = sale.driverCollectedAmount + parseFloat(collectedAmount);
    const remainingToCollect = sale.totalAmount - newCollectedAmount;
    
    // Statusni aniqlash
    let newStatus = 'PENDING';
    if (newCollectedAmount >= sale.totalAmount) {
      newStatus = 'COLLECTED';
    } else if (newCollectedAmount > 0) {
      newStatus = 'PARTIAL';
    }
    
    // Sotuvni yangilash
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        driverCollectedAmount: newCollectedAmount,
        driverPaymentStatus: newStatus
      },
      include: {
        customer: true,
        driver: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // To'lov tarixini saqlash (agar alohida jadval bo'lsa)
    try {
      // Bu yerda Payment modeliga yozish mumkin
      console.log(`✅ Haydovchi to'lovi qayd etildi: ${sale.driver?.name} - $${collectedAmount}`);
    } catch (paymentError) {
      console.error('To\'lov tarixini saqlashda xatolik:', paymentError);
    }
    
    // Kassaga pul qo'shish
    if (parseFloat(collectedAmount) > 0) {
      try {
        const { addToCashbox } = await import('../utils/cashier-operations');
        await addToCashbox({
          amount: parseFloat(collectedAmount),
          currency: sale.currency || 'USD',
          type: 'INCOME',
          category: 'DRIVER_COLLECTION',
          description: `Haydovchi ${sale.driver?.name || 'Noma\'lum'} dan sotuv #${sale.id.slice(-6)} uchun`,
          userId: req.user?.id || 'unknown',
          userName: req.user?.name || 'unknown',
          relatedId: sale.id,
          relatedType: 'SALE'
        });
        console.log(`✅ Kassaga qo'shildi: $${collectedAmount}`);
      } catch (cashboxError) {
        console.error('❌ Kassaga qo\'shishda xatolik:', cashboxError);
      }
    }
    
    // Haydovchiga xabar yuborish (Telegram bot orqali)
    if (sale.driver?.telegramChatId) {
      try {
        const { sendDriverPaymentReceivedNotification } = await import('../utils/telegram-notifications');
        await sendDriverPaymentReceivedNotification(
          sale.driver.telegramChatId,
          {
            saleId: sale.id,
            collectedAmount: parseFloat(collectedAmount),
            totalCollected: newCollectedAmount,
            remaining: remainingToCollect,
            currency: sale.currency
          }
        );
      } catch (notifyError) {
        console.log('⚠️ Haydovchiga xabar yuborishda xatolik:', notifyError);
      }
    }
    
    res.json({
      sale: updatedSale,
      collection: {
        collectedAmount: parseFloat(collectedAmount),
        totalCollected: newCollectedAmount,
        remaining: remainingToCollect,
        paymentMethod,
        notes
      },
      message: remainingToCollect > 0
        ? `✅ To'lov qabul qilindi! Qoldiq: $${remainingToCollect.toFixed(2)}`
        : '✅ To\'lov to\'liq yig\'ildi!'
    });
    
  } catch (error) {
    console.error('Haydovchi to\'lovini qabul qilishda xatolik:', error);
    res.status(500).json({ error: 'Haydovchi to\'lovini qabul qilishda xatolik' });
  }
});

// Haydovchidan kutilayotgan to'lovlar ro'yxati
router.get('/driver-pending-collections', authorize('ADMIN', 'CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { driverId, startDate, endDate } = req.query;
    
    const where: any = {
      driverId: { not: null },
      OR: [
        { driverPaymentStatus: 'PENDING' },
        { driverPaymentStatus: 'PARTIAL' }
      ]
    };
    
    if (driverId) {
      where.driverId = driverId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }
    
    const pendingSales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        driver: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Guruhlash va statistika
    const summary = {
      totalPending: pendingSales.length,
      totalAmount: pendingSales.reduce((sum, s) => sum + s.totalAmount, 0),
      totalCollected: pendingSales.reduce((sum, s) => sum + s.driverCollectedAmount, 0),
      totalRemaining: pendingSales.reduce((sum, s) => sum + (s.totalAmount - s.driverCollectedAmount), 0)
    };
    
    // Haydovchi bo'yicha guruhlash
    const byDriver: Record<string, any> = {};
    pendingSales.forEach(sale => {
      if (sale.driver) {
        if (!byDriver[sale.driver.id]) {
          byDriver[sale.driver.id] = {
            driver: sale.driver,
            sales: [],
            totalAmount: 0,
            totalCollected: 0,
            totalRemaining: 0
          };
        }
        byDriver[sale.driver.id].sales.push(sale);
        byDriver[sale.driver.id].totalAmount += sale.totalAmount;
        byDriver[sale.driver.id].totalCollected += sale.driverCollectedAmount;
        byDriver[sale.driver.id].totalRemaining += (sale.totalAmount - sale.driverCollectedAmount);
      }
    });
    
    res.json({
      sales: pendingSales,
      summary,
      byDriver: Object.values(byDriver)
    });
    
  } catch (error) {
    console.error('Kutilayotgan to\'lovlarni olishda xatolik:', error);
    res.status(500).json({ error: 'Kutilayotgan to\'lovlarni olishda xatolik' });
  }
});

// Haydovchi balansi/umumiy statistikasi
router.get('/driver/:driverId/summary', authorize('ADMIN', 'CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }
    
    // Jami sotuvlar
    const totalSales = await prisma.sale.count({
      where: {
        driverId,
        ...dateFilter
      }
    });
    
    // Jami summa
    const totalAmount = await prisma.sale.aggregate({
      where: {
        driverId,
        ...dateFilter
      },
      _sum: {
        totalAmount: true,
        driverCollectedAmount: true
      }
    });
    
    // Status bo'yicha
    const byStatus = await prisma.sale.groupBy({
      by: ['driverPaymentStatus'],
      where: {
        driverId,
        ...dateFilter
      },
      _count: {
        _all: true
      },
      _sum: {
        totalAmount: true,
        driverCollectedAmount: true
      }
    });
    
    // Haydovchi ma'lumotlari
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Haydovchi topilmadi' });
    }
    
    res.json({
      driver,
      summary: {
        totalSales,
        totalAmount: totalAmount._sum.totalAmount || 0,
        totalCollected: totalAmount._sum.driverCollectedAmount || 0,
        totalRemaining: (totalAmount._sum.totalAmount || 0) - (totalAmount._sum.driverCollectedAmount || 0)
      },
      byStatus
    });
    
  } catch (error) {
    console.error('Haydovchi summary xatolik:', error);
    res.status(500).json({ error: 'Haydovchi ma\'lumotlarini olishda xatolik' });
  }
});
