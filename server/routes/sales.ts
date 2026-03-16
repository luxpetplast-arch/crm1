import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { notifyCustomerSale, notifyLowStock } from '../utils/telegram-notifications';
import { createInvoiceForSale } from '../utils/invoice-generator';

const router = Router();
const prisma = new PrismaClient();

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

router.post('/', authorize('ADMIN', 'CASHIER'), async (req: AuthRequest, res) => {
  try {
    const { customerId, items, totalAmount, paidAmount, currency, paymentStatus, paymentDetails } = req.body;

    // YANGI FORMAT: items array
    // items: [{ productId, quantity, pricePerBag }, ...]
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Kamida bitta mahsulot tanlash kerak' });
    }

    // 1. VALIDATSIYA - Barcha mahsulotlar va stock tekshirish
    const validationResults = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ 
          error: `Mahsulot topilmadi: ${item.productId}` 
        });
      }

      if (product.currentStock < parseInt(item.quantity)) {
        return res.status(400).json({ 
          error: `${product.name} uchun omborda yetarli mahsulot yo'q`,
          available: product.currentStock,
          requested: parseInt(item.quantity)
        });
      }

      validationResults.push({
        product,
        item,
        subtotal: parseInt(item.quantity) * parseFloat(item.pricePerBag)
      });
    }

    // 2. SOTUV YARATISH (Multi-Product)
    const sale = await prisma.sale.create({
      data: {
        customerId,
        userId: req.user!.id,
        quantity: items.reduce((sum, item) => sum + parseInt(item.quantity), 0), // Jami miqdor
        pricePerBag: 0, // Multi-product uchun 0
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount) || 0,
        currency: currency || 'USD',
        paymentStatus: paymentStatus || 'UNPAID',
        paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null,
      },
      include: {
        customer: true,
      },
    });

    // 3. SALE ITEMS YARATISH
    const saleItems = [];
    for (const validation of validationResults) {
      const saleItem = await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: validation.item.productId,
          quantity: parseInt(validation.item.quantity),
          pricePerBag: parseFloat(validation.item.pricePerBag),
          subtotal: validation.subtotal
        },
        include: {
          product: true
        }
      });
      saleItems.push(saleItem);
    }

    // AVTOMATLASHTIRISH FLAGS
    let stockUpdated = false;
    let cashboxUpdated = false;
    let invoiceCreated = false;
    let notificationSent = false;
    let lowStockAlert = false;

    try {
      // 4. HAR BIR MAHSULOT UCHUN OMBOR AVTOMATIK KAMAYTIRISH
      for (const validation of validationResults) {
        const { product, item } = validation;
        const quantity = parseInt(item.quantity);
        
        const newStock = product.currentStock - quantity;
        const newUnits = product.currentUnits - (quantity * product.unitsPerBag);
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            currentStock: newStock,
            currentUnits: newUnits
          }
        });

        console.log(`✅ ${product.name} stock yangilandi: ${product.currentStock} → ${newStock}`);

        // 5. STOCK MOVEMENT YARATISH
        try {
          await prisma.stockMovement.create({
            data: {
              productId: product.id,
              type: 'SALE',
              quantity: -quantity,
              units: -(quantity * product.unitsPerBag),
              previousStock: product.currentStock,
              previousUnits: product.currentUnits,
              newStock: newStock,
              newUnits: newUnits,
              userId: req.user!.id,
              userName: (req.user as any).name || req.user!.email,
              reason: `Multi-Sotuv: ${sale.id}`,
              notes: `Mijoz: ${sale.customer.name}, Mahsulot: ${product.name}`
            }
          });
        } catch (error) {
          console.log(`⚠️ ${product.name} StockMovement yaratilmadi:`, error);
        }

        // 6. LOW STOCK ALERT
        if (newStock <= product.minStockLimit) {
          try {
            await notifyLowStock(product.name, newStock, product.minStockLimit);
            lowStockAlert = true;
            console.log(`⚠️ ${product.name} uchun low stock alert yuborildi`);
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
                currency: 'UZS',
                category: 'SALE',
                description: `Sotuv (Naqd): ${saleItems.map(item => item.product.name).join(', ')}`,
                userId: req.user!.id,
                userName: (req.user as any).name || req.user!.email,
                paymentMethod: 'CASH'
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
                currency: 'USD',
                category: 'SALE',
                description: `Sotuv (Dollar): ${saleItems.map(item => item.product.name).join(', ')}`,
                userId: req.user!.id,
                userName: (req.user as any).name || req.user!.email,
                paymentMethod: 'CARD'
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
                currency: 'UZS',
                category: 'SALE',
                description: `Sotuv (Click): ${saleItems.map(item => item.product.name).join(', ')}`,
                userId: req.user!.id,
                userName: (req.user as any).name || req.user!.email,
                paymentMethod: 'CLICK'
              }
            });
            console.log(`✅ Kassa (Click): ${details.click} so'm`);
          }
          
          cashboxUpdated = true;
        } catch (error) {
          console.log(`⚠️ Kassa tranzaksiyasi xatolik:`, error);
        }
      }

      // 8. INVOICE YARATISH
      try {
        const invoice = await createInvoiceForSale(sale.id);
        if (invoice) {
          invoiceCreated = true;
          console.log(`✅ Invoice yaratildi: ${invoice.invoiceNumber}`);
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

      // 10. MIJOZ QARZ VA BALANS YANGILASH
      const debtAmount = parseFloat(totalAmount) - parseFloat(paidAmount);
      
      if (debtAmount > 0) {
        // Mijoz kam to'lagan - qarz qo'shish
        try {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              debt: {
                increment: debtAmount
              },
              lastPurchase: new Date()
            }
          });
          console.log(`✅ Mijoz qarz yangilandi: +${debtAmount}`);
        } catch (error) {
          console.log(`⚠️ Mijoz qarz yangilanmadi:`, error);
        }
      } else if (debtAmount < 0) {
        // Mijoz ko'proq to'lagan - balansga qo'shish
        const overpayment = Math.abs(debtAmount);
        try {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              balance: {
                increment: overpayment
              },
              lastPurchase: new Date()
            }
          });
          console.log(`✅ Mijoz balansiga qo'shildi: +${overpayment}`);
        } catch (error) {
          console.log(`⚠️ Mijoz balansi yangilanmadi:`, error);
        }
      } else {
        // To'liq to'langan
        try {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              lastPurchase: new Date()
            }
          });
        } catch (error) {
          console.log(`⚠️ Mijoz lastPurchase yangilanmadi:`, error);
        }
      }

      // 11. AUDIT LOG
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'CREATE_MULTI_SALE',
            entity: 'Sale',
            entityId: sale.id,
            changes: JSON.stringify({
              customerId,
              items: saleItems.map(item => ({
                productName: item.product.name,
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

    // Response with automation status
    const response = {
      ...sale,
      items: saleItems,
      automationStatus: {
        stockDeducted: stockUpdated,
        cashboxUpdated: cashboxUpdated,
        invoiceGenerated: invoiceCreated,
        telegramSent: notificationSent,
        lowStockAlert: lowStockAlert
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Create multi-sale error:', error);
    res.status(500).json({ error: 'Sotuv yaratishda xatolik' });
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
