import { prisma } from '../utils/prisma';
import type { Sale, SaleItem, Product, Customer, Prisma } from '@prisma/client';

// Types
export interface CreateSaleInput {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    pricePerBag: number;
    saleType?: 'bag' | 'piece';
  }>;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  paymentMethod?: 'CASH' | 'CARD' | 'CLICK';
  paymentDetails?: { uzs?: number; usd?: number; click?: number };
  driverId?: string;
  isKocha?: boolean;
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  userId: string;
  userName: string;
}

export interface UpdateSaleInput {
  id: string;
  customerId?: string;
  items?: CreateSaleInput['items'];
  totalAmount?: number;
  paidAmount?: number;
  currency?: string;
  paymentStatus?: string;
  paymentDetails?: CreateSaleInput['paymentDetails'];
  driverId?: string;
  isKocha?: boolean;
  manualCustomerName?: string;
  manualCustomerPhone?: string;
}

export interface SaleWithRelations extends Sale {
  items: (SaleItem & { product: Product | null })[];
  customer: Customer | null;
}

export interface SaleFilters {
  productId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: string;
  userId?: string;
}

export class SalesService {
  
  // Barcha sotuvlarni olish (optimized - N+1 fixed)
  async getAllSales(filters?: SaleFilters): Promise<SaleWithRelations[]> {
    const where: Prisma.SaleWhereInput = {};

    if (filters?.productId) {
      where.items = { some: { productId: filters.productId } };
    }
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.sale.findMany({
      where,
      include: {
        customer: true,
        driver: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitsPerBag: true,
                currentStock: true,
                currentUnits: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<SaleWithRelations[]>;
  }

  // Bitta sotuvni olish
  async getSaleById(id: string): Promise<SaleWithRelations | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitsPerBag: true,
                currentStock: true,
                currentUnits: true,
              }
            }
          }
        },
        invoice: true,
      },
    }) as unknown as Promise<SaleWithRelations | null>;
  }

  // Sotuv yaratish (transaction bilan)
  async createSale(input: CreateSaleInput): Promise<SaleWithRelations> {
    const {
      items, totalAmount, paidAmount, currency, paymentMethod, paymentDetails,
      customerId, driverId, userId, userName, isKocha,
      manualCustomerName, manualCustomerPhone
    } = input;

    // Validatsiya
    if (!items?.length) {
      throw new Error('Kamida bitta mahsulot tanlash kerak');
    }

    // Mahsulotlarni bitta query bilan olish
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Stock tekshiruvi
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Mahsulot topilmadi: ${item.productId}`);

      const isPieceSale = item.saleType === 'piece';
      const available = isPieceSale ? product.currentUnits : product.currentStock;
      
      if (available < item.quantity) {
        throw new Error(`${product.name} uchun omborda yetarli mahsulot yo'q`);
      }
    }

    // Transaction bilan yaratish
    const result = await prisma.$transaction(async (tx) => {
      // 1. Sale yaratish
      const sale = await tx.sale.create({
        data: {
          customerId: isKocha ? null : customerId,
          userId,
          driverId: driverId || null,
          quantity: items.reduce((sum, i) => sum + i.quantity, 0),
          pricePerBag: 0,
          totalAmount,
          paidAmount,
          currency,
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null,
          isKocha: !!isKocha,
          manualCustomerName: manualCustomerName || null,
          manualCustomerPhone: manualCustomerPhone || null,
        },
        include: { customer: true }
      });

      // 2. Sale items yaratish
      const saleItems = await Promise.all(
        items.map(item => tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            pricePerBag: item.pricePerBag,
            subtotal: item.quantity * item.pricePerBag,
          },
          include: { product: true }
        }))
      );

      // 3. Stock yangilash
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const isPieceSale = item.saleType === 'piece';
        
        const bagsToDeduct = isPieceSale 
          ? item.quantity / product.unitsPerBag 
          : item.quantity;
        const unitsToDeduct = isPieceSale 
          ? item.quantity 
          : item.quantity * product.unitsPerBag;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: bagsToDeduct },
            currentUnits: { decrement: unitsToDeduct },
          }
        });

        // Stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -bagsToDeduct,
            units: -unitsToDeduct,
            previousStock: product.currentStock,
            previousUnits: product.currentUnits,
            newStock: product.currentStock - bagsToDeduct,
            newUnits: product.currentUnits - unitsToDeduct,
            userId,
            userName,
            reason: `Sotuv: ${sale.id}`,
          }
        });
      }

      // 4. Mijoz balans/qarz yangilash
      if (!isKocha && customerId) {
        const debtAmount = totalAmount - paidAmount;
        if (debtAmount > 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              debtUSD: { increment: debtAmount },
              lastPurchase: new Date()
            }
          });
        } else {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              balanceUSD: { increment: paidAmount },
              lastPurchase: new Date()
            }
          });
        }
      }

      // 5. Kassa tranzaksiyasi (to'lov usuli va valyuta bo'yicha)
      const method = paymentMethod || 'CASH';
      
      if (paymentDetails) {
        // UZS tushirish
        if (paymentDetails.uzs && paymentDetails.uzs > 0) {
          const paymentType = method === 'CLICK' ? 'Click' : (method === 'CARD' ? 'Karta' : 'Naqd');
          await tx.cashboxTransaction.create({
            data: {
              type: 'INCOME',
              amount: paymentDetails.uzs,
              category: 'SALE',
              description: `Sotuv: ${paymentType} UZS`,
              userId,
              userName,
            }
          });
        }
        
        // USD tushirish
        if (paymentDetails.usd && paymentDetails.usd > 0) {
          const paymentType = method === 'CLICK' ? 'Click' : (method === 'CARD' ? 'Karta' : 'Naqd');
          await tx.cashboxTransaction.create({
            data: {
              type: 'INCOME',
              amount: paymentDetails.usd,
              category: 'SALE',
              description: `Sotuv: ${paymentType} USD`,
              userId,
              userName,
            }
          });
        }
        
        // Click tushirish (alohida)
        if (paymentDetails.click && paymentDetails.click > 0) {
          await tx.cashboxTransaction.create({
            data: {
              type: 'INCOME',
              amount: paymentDetails.click,
              category: 'SALE',
              description: `Sotuv: Click UZS`,
              userId,
              userName,
            }
          });
        }
      } else if (paidAmount > 0) {
        // Faqat asosiy valyuta bo'yicha (paymentDetails yo'q bo'lsa)
        const paymentType = method === 'CLICK' ? 'Click' : (method === 'CARD' ? 'Karta' : 'Naqd');
        await tx.cashboxTransaction.create({
          data: {
            type: 'INCOME',
            amount: paidAmount,
            category: 'SALE',
            description: `Sotuv: ${paymentType} ${currency}`,
            userId,
            userName,
          }
        });
      }

      return { ...sale, items: saleItems };
    });

    return result as SaleWithRelations;
  }

  // Sotuv yangilash
  async updateSale(input: UpdateSaleInput): Promise<SaleWithRelations> {
    const { id, items, ...updateData } = input;

    return prisma.$transaction(async (tx) => {
      // Eski sotuvni olish
      const oldSale = await tx.sale.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          customer: true,
        }
      });

      if (!oldSale) throw new Error('Sotuv topilmadi');

      // Eski stock qaytarish
      for (const item of oldSale.items) {
        if (!item.productId || !item.product) continue;
        
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { increment: item.quantity },
            currentUnits: { 
              increment: item.quantity * item.product.unitsPerBag 
            },
          }
        });
      }

      // Sale yangilash
      const updated = await tx.sale.update({
        where: { id },
        data: {
          customerId: updateData.customerId,
          driverId: updateData.driverId,
          totalAmount: updateData.totalAmount,
          paidAmount: updateData.paidAmount,
          currency: updateData.currency,
          paymentStatus: updateData.paymentStatus,
        },
        include: { 
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unitsPerBag: true,
                  currentStock: true,
                  currentUnits: true,
                }
              }
            }
          }
        }
      });

      return updated as SaleWithRelations;
    });
  }

  // Sotuv o'chirish
  async deleteSale(id: string, userId: string, userName: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          customer: true,
        }
      });

      if (!sale) throw new Error('Sotuv topilmadi');

      // Stock qaytarish
      for (const item of sale.items) {
        if (!item.productId || !item.product) continue;
        
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { increment: item.quantity },
            currentUnits: { 
              increment: item.quantity * item.product.unitsPerBag 
            },
          }
        });

        // Stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE_CANCEL',
            quantity: item.quantity,
            units: item.quantity * item.product.unitsPerBag,
            previousStock: item.product.currentStock,
            previousUnits: item.product.currentUnits,
            newStock: item.product.currentStock + item.quantity,
            newUnits: item.product.currentUnits + (item.quantity * item.product.unitsPerBag),
            userId,
            userName,
            reason: `Sotuv o'chirildi: ${id}`,
          }
        });
      }

      // Mijoz qarzini qaytarish
      if (sale.customerId) {
        const debtToReduce = sale.totalAmount - sale.paidAmount;
        if (debtToReduce > 0) {
          await tx.customer.update({
            where: { id: sale.customerId },
            data: { debtUSD: { decrement: debtToReduce } }
          });
        }
      }

      // O'chirish
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });
  }

  // Statistika
  async getSalesStats(startDate?: Date, endDate?: Date) {
    const where: Prisma.SaleWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalSales,
      totalRevenue,
      totalPaid,
      byPaymentStatus,
      byCurrency
    ] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.aggregate({ where, _sum: { totalAmount: true } }),
      prisma.sale.aggregate({ where, _sum: { paidAmount: true } }),
      prisma.sale.groupBy({
        by: ['paymentStatus'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      prisma.sale.groupBy({
        by: ['currency'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      totalSales,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalPaid: totalPaid._sum.paidAmount || 0,
      totalDebt: (totalRevenue._sum.totalAmount || 0) - (totalPaid._sum.paidAmount || 0),
      byPaymentStatus,
      byCurrency
    };
  }
}

export const salesService = new SalesService();
