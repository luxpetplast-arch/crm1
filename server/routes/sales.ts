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

    console.log('📥 POST /sales - Data:', { customerId, isKocha, itemsCount: items?.length, totalAmount, paidAmount });

    if (!customerId && !isKocha) {
      return res.status(400).json({ error: 'Mijoz tanlanmagan' });
    }

    // USER tekshirish
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Kamida bitta mahsulot tanlash kerak' });
    }

    // 1. ВАЛИДАЦИЯ
    const validationResults = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        return res.status(400).json({ error: `Item ${i + 1} da mahsulot tanlanmagan` });
      }
      
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      }

      const requestedQty = parseFloat(item.quantity) || 0;
      if (requestedQty <= 0) {
        return res.status(400).json({ error: `${product.name} miqdori xato` });
      }

      if (product.currentStock < requestedQty) {
        return res.status(400).json({ 
          error: `${product.name} uchun omborda yetarli mahsulot yo'q`,
          available: product.currentStock,
          requested: requestedQty
        });
      }

      const price = parseFloat(item.pricePerBag || item.pricePerPiece || 0);
      validationResults.push({ product, item, subtotal: requestedQty * price });
    }

    // 2. СОТУВ ЯРАТИШ
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const sale = await prisma.sale.create({
      data: {
        customerId: isKocha ? null : customerId,
        userId: userId,
        driverId: driverId || null,
        quantity: totalQty,
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

    // 3. SALE ITEMS ЯРАТИШ
    const saleItems = [];
    for (const validation of validationResults) {
      const saleItem = await prisma.saleItem.create({
        data: {
          saleId: sale.id,
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
        
        const newStock = product.currentStock - quantity;
        const unitsChange = -quantity * product.unitsPerBag;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: newStock,
          currentUnits: {
            increment: unitsChange
          }
        }
      });

      console.log(`✅ ${product.name} stock yangilandi: ${product.currentStock} → ${newStock}`);

      // 5. STOCK MOVEMENT ЯРАТИШ
      try {
        const unitsChange = -quantity * product.unitsPerBag;
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: -quantity,
            units: unitsChange,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: newStock,
            newUnits: product.currentUnits + unitsChange,
            userId: userId,
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Multi-Sotuv: ${sale.id}`,
            notes: `Mijoz: ${sale.isKocha ? sale.manualCustomerName || 'Ko\'cha' : sale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}`
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
        // paymentCurrency 'AUTO' bo'lsa currency dan foydalanamiz, aks holda paymentCurrency
        const effectiveCurrency = (paymentCurrency && paymentCurrency !== 'AUTO') ? paymentCurrency : (currency || 'USD');
        
        console.log(`💰 Qarz hisoblash: debtAmount=${debtAmount}, effectiveCurrency=${effectiveCurrency}`);
        
        if (debtAmount > 0) {
          // Mijoz kam to'lagan - qarz qo'shish
          try {
            if (effectiveCurrency === 'UZS') {
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
              console.log(`✅ Mijoz qarz yangilandi (UZS): +${debtAmount}`);
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
              console.log(`✅ Mijoz qarz yangilandi (USD): +${debtAmount}`);
            }
          } catch (error) {
            console.log(`⚠️ Mijoz qarz yangilanmadi:`, error);
          }
        } else {
          // Mijoz to'lagan yoki ortiqcha to'lagan - balansga qo'shish
          const paymentAmount = parseFloat(paidAmount);
          try {
            if (effectiveCurrency === 'UZS') {
              await prisma.customer.update({
                where: { id: customerId },
                data: {
                  balanceUZS: {
                    increment: paymentAmount
                  },
                  lastPurchase: new Date()
                }
              });
              console.log(`✅ Mijoz balansiga qo'shildi (UZS): +${paymentAmount}`);
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
              console.log(`✅ Mijoz balansiga qo'shildi (USD): +${paymentAmount}`);
            }
          } catch (error) {
            console.log(`⚠️ Mijoz balansi yangilanmadi:`, error);
          }
        }
      } else {
        console.log('✅ Ko\'chaga sotuv - mijoz qarz/balans yangilanmadi');
      }

      // 11. AUDIT LOG
      try {
        await prisma.auditLog.create({
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
    const response = {
      ...sale,
      items: saleItems,
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

    // 1. Eski mahsulotlarni omborda qaytarish
    for (const oldItem of oldSale.items) {
      if (!oldItem.productId) continue;
      
      const oldProduct = await prisma.product.findUnique({ where: { id: oldItem.productId } });
      if (!oldProduct) continue;
      
      await prisma.product.update({
        where: { id: oldItem.productId },
        data: {
          currentStock: { increment: oldItem.quantity },
          currentUnits: { increment: oldItem.quantity * oldProduct.unitsPerBag }
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
      if (product.currentStock < requestedQty) {
        return res.status(400).json({ 
          error: `${product.name} uchun omborda yetarli mahsulot yo'q`,
          available: product.currentStock,
          requested: requestedQty
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
      
      const newStock = product.currentStock - quantity;
      const unitsChange = -quantity * product.unitsPerBag;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: newStock,
          currentUnits: {
            increment: unitsChange
          }
        }
      });

      console.log(`✅ ${product.name} stock yangilandi: ${product.currentStock} → ${newStock}`);

      // Stock movement яратиш
      try {
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: -quantity,
            units: -quantity * product.unitsPerBag,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: newStock,
            newUnits: product.currentUnits - (quantity * product.unitsPerBag),
            userId: userId,
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Sotuv tahrirlandi: ${id}`,
            notes: `Mijoz: ${updatedSale.isKocha ? updatedSale.manualCustomerName || 'Ko\'cha' : updatedSale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}`
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

    // 2. Omborda mahsulotlarni qaytarish
    for (const item of sale.items) {
      if (!item.productId) continue;
      
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: { increment: item.quantity },
          currentUnits: { increment: item.quantity * product.unitsPerBag }
        }
      });

      // Stock movement yaratish
      try {
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE_CANCEL',
            quantity: item.quantity,
            units: item.quantity * product.unitsPerBag,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: product.currentStock + item.quantity,
            newUnits: product.currentUnits + (item.quantity * product.unitsPerBag),
            userId: userId || 'system',
            userName: (req.user as any)?.name || req.user?.email || 'Noma\'lum',
            reason: `Sotuv o'chirildi: ${id}`,
            notes: `Mijoz: ${sale.isKocha ? sale.manualCustomerName || 'Ko\'cha' : sale.customer?.name || 'Noma\'lum'}, Mahsulot: ${product.name}`
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
