import { prisma } from './prisma';

export interface InventoryAuditData {
  userId: string;
  userName: string;
  action: string;
  entity: 'INVENTORY';
  entityId: string;
  productId?: string;
  productName?: string;
  details: {
    type: 'ADD' | 'REMOVE' | 'ADJUST' | 'PRODUCTION' | 'SALE' | 'TRANSFER' | 'EDIT' | 'DELETE' | 'VIEW';
    quantityBags?: number;
    quantityUnits?: number;
    previousStock?: number;
    previousUnits?: number;
    newStock?: number;
    newUnits?: number;
    reason?: string;
    notes?: string;
    batchId?: string;
    shift?: string;
    responsiblePerson?: string;
    oldValue?: any;
    newValue?: any;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Ombor harakatini audit logga yozish
 */
export async function logInventoryAction(data: InventoryAuditData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: JSON.stringify({
          userName: data.userName,
          productId: data.productId,
          productName: data.productName,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Inventory audit log error:', error);
  }
}

/**
 * Ombor tarixini olish
 */
export async function getInventoryHistory(filters?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  productId?: string;
  action?: string;
  limit?: number;
}) {
  try {
    const where: any = {
      entity: 'INVENTORY',
    };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = { contains: filters.action };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });

    // ProductId bo'yicha filtrlash (changes ichida)
    let filteredLogs = logs;
    if (filters?.productId) {
      filteredLogs = logs.filter(log => {
        if (log.changes) {
          try {
            const changes = JSON.parse(log.changes);
            return changes.productId === filters.productId;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    }

    return filteredLogs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      entityId: log.entityId,
      details: log.changes ? JSON.parse(log.changes) : null,
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Get inventory history error:', error);
    return [];
  }
}

/**
 * Ombor statistikasini olish
 */
export async function getInventoryAuditStats(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {
      entity: 'INVENTORY',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Statistika hisoblash
    const stats = {
      totalActions: logs.length,
      byAction: {} as Record<string, number>,
      byUser: {} as Record<string, { name: string; count: number }>,
      byType: {
        ADD: 0,
        REMOVE: 0,
        ADJUST: 0,
        PRODUCTION: 0,
        SALE: 0,
        TRANSFER: 0,
        EDIT: 0,
        DELETE: 0,
        VIEW: 0,
      },
      byProduct: {} as Record<string, { name: string; count: number }>,
      totalQuantity: {
        added: 0,
        removed: 0,
        adjusted: 0,
      },
    };

    logs.forEach(log => {
      // Action bo'yicha
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // User bo'yicha
      if (!stats.byUser[log.userId]) {
        stats.byUser[log.userId] = {
          name: log.user.name,
          count: 0,
        };
      }
      stats.byUser[log.userId].count++;

      // Type, product va quantity bo'yicha
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const type = changes.details?.type;
          const productId = changes.productId;
          const productName = changes.productName;
          const quantityBags = changes.details?.quantityBags || 0;

          if (type && stats.byType.hasOwnProperty(type)) {
            stats.byType[type as keyof typeof stats.byType]++;
          }

          if (productId && productName) {
            if (!stats.byProduct[productId]) {
              stats.byProduct[productId] = {
                name: productName,
                count: 0,
              };
            }
            stats.byProduct[productId].count++;
          }

          if (type === 'ADD' || type === 'PRODUCTION') {
            stats.totalQuantity.added += quantityBags;
          } else if (type === 'REMOVE' || type === 'SALE') {
            stats.totalQuantity.removed += quantityBags;
          } else if (type === 'ADJUST') {
            stats.totalQuantity.adjusted += Math.abs(quantityBags);
          }
        } catch (e) {}
      }
    });

    return stats;
  } catch (error) {
    console.error('Get inventory audit stats error:', error);
    return null;
  }
}

/**
 * Mahsulot tarixini olish
 */
export async function getProductHistory(productId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'INVENTORY',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // ProductId bo'yicha filtrlash
    const productLogs = logs.filter(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          return changes.productId === productId;
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    return productLogs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      details: log.changes ? JSON.parse(log.changes) : null,
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Get product history error:', error);
    return [];
  }
}

/**
 * Ombor o'zgarishlarini taqqoslash
 */
export async function compareInventoryChanges(productId: string) {
  try {
    const history = await getProductHistory(productId);
    
    if (history.length < 2) {
      return null;
    }

    const changes = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];

      const prevStock = prev.details?.details?.previousStock || 0;
      const currStock = curr.details?.details?.newStock || 0;
      const difference = currStock - prevStock;

      changes.push({
        from: prev,
        to: curr,
        timestamp: curr.createdAt,
        user: curr.user,
        stockDifference: difference,
        differences: {
          action: prev.action !== curr.action ? { old: prev.action, new: curr.action } : null,
          stock: prevStock !== currStock ? { old: prevStock, new: currStock } : null,
        },
      });
    }

    return changes;
  } catch (error) {
    console.error('Compare inventory changes error:', error);
    return null;
  }
}

/**
 * Shubhali ombor faoliyatini aniqlash
 */
export async function detectSuspiciousInventoryActivity(userId?: string) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: any = {
      entity: 'INVENTORY',
      createdAt: { gte: oneDayAgo },
    };

    if (userId) {
      where.userId = userId;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const suspicious: Array<{
      type: string;
      message: string;
      userId?: string;
      count?: number;
      quantity?: number;
      logId?: string;
      time?: Date;
      productName?: string;
      severity: string;
    }> = [];

    // Bir xil foydalanuvchidan ko'p o'zgarishlar
    const userCounts: Record<string, number> = {};
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > 50) { // 30 dan 50 ga oshirdik
        const user = logs.find(l => l.userId === userId)?.user;
        suspicious.push({
          type: 'HIGH_FREQUENCY',
          message: `${user?.name} 24 soat ichida ${count} ta ombor o'zgarishi amalga oshirdi`,
          userId,
          count,
          severity: 'WARNING',
        });
      }
    });

    // Katta miqdor o'zgarishlar
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const quantityBags = changes.details?.quantityBags || 0;
          const productName = changes.productName;
          
          // 100 dan 200 ga oshirdik - faqat juda katta miqdorlar uchun
          if (Math.abs(quantityBags) > 200) {
            suspicious.push({
              type: 'LARGE_QUANTITY',
              message: `${log.user.name} juda katta miqdor (${Math.abs(quantityBags)} qop) o'zgartirdi - ${productName}`,
              userId: log.userId,
              quantity: Math.abs(quantityBags),
              productName,
              logId: log.id,
              severity: 'HIGH',
            });
          } else if (Math.abs(quantityBags) > 100) {
            // 100-200 oralig'i uchun MEDIUM
            suspicious.push({
              type: 'LARGE_QUANTITY',
              message: `${log.user.name} katta miqdor (${Math.abs(quantityBags)} qop) o'zgartirdi - ${productName}`,
              userId: log.userId,
              quantity: Math.abs(quantityBags),
              productName,
              logId: log.id,
              severity: 'MEDIUM',
            });
          }
        } catch (e) {}
      }
    });

    // Tunda o'zgarishlar (22:00 - 06:00)
    // Faqat ish kunlari va muhim o'zgarishlar uchun
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      const day = new Date(log.createdAt).getDay(); // 0 = Yakshanba, 6 = Shanba
      
      // Faqat ish kunlari (Dushanba-Juma) va kechki vaqtda (22:00-06:00)
      if ((hour >= 22 || hour < 6) && day >= 1 && day <= 5) {
        let productName = '';
        let quantityBags = 0;
        
        if (log.changes) {
          try {
            const changes = JSON.parse(log.changes);
            productName = changes.productName || '';
            quantityBags = Math.abs(changes.details?.quantityBags || 0);
          } catch (e) {}
        }
        
        // Faqat katta o'zgarishlar uchun warning
        if (quantityBags > 50) {
          suspicious.push({
            type: 'NIGHT_ACTIVITY',
            message: `${log.user.name} tunda (${hour}:00) katta miqdor (${quantityBags} qop) o'zgartirdi${productName ? ` - ${productName}` : ''}`,
            userId: log.userId,
            time: log.createdAt,
            productName,
            quantity: quantityBags,
            logId: log.id,
            severity: 'MEDIUM',
          });
        }
      }
    });

    // Tez-tez tuzatishlar (ADJUST)
    const adjustCounts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          if (changes.details?.type === 'ADJUST') {
            adjustCounts[log.userId] = (adjustCounts[log.userId] || 0) + 1;
          }
        } catch (e) {}
      }
    });

    Object.entries(adjustCounts).forEach(([userId, count]) => {
      if (count > 10) {
        const user = logs.find(l => l.userId === userId)?.user;
        suspicious.push({
          type: 'FREQUENT_ADJUSTMENTS',
          message: `${user?.name} 24 soat ichida ${count} marta ombor tuzatish qildi`,
          userId,
          count,
          severity: 'WARNING',
        });
      }
    });

    return suspicious;
  } catch (error) {
    console.error('Detect suspicious inventory activity error:', error);
    return [];
  }
}

/**
 * Ombor balans tarixini olish
 */
export async function getStockBalanceHistory(productId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'INVENTORY',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // ProductId bo'yicha filtrlash va balans hisoblash
    const balanceHistory: Array<{
      date: string;
      stock: number;
      units: number;
      action: string;
      change: number;
    }> = [];

    let currentStock = 0;
    let currentUnits = 0;

    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          if (changes.productId === productId) {
            const newStock = changes.details?.newStock || 0;
            const newUnits = changes.details?.newUnits || 0;
            const change = newStock - currentStock;

            balanceHistory.push({
              date: new Date(log.createdAt).toISOString(),
              stock: newStock,
              units: newUnits,
              action: log.action,
              change,
            });

            currentStock = newStock;
            currentUnits = newUnits;
          }
        } catch (e) {}
      }
    });

    return balanceHistory;
  } catch (error) {
    console.error('Get stock balance history error:', error);
    return [];
  }
}
