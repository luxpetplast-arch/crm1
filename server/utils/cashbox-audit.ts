import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CashboxAuditData {
  userId: string;
  userName: string;
  action: string;
  entity: 'CASHBOX';
  entityId: string;
  details: {
    type: 'ADD' | 'WITHDRAW' | 'TRANSFER' | 'EDIT' | 'DELETE' | 'VIEW';
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
    description?: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Kassa tranzaksiyasini audit logga yozish
 */
export async function logCashboxAction(data: CashboxAuditData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: JSON.stringify({
          userName: data.userName,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Cashbox audit log error:', error);
  }
}

/**
 * Kassa tarixini olish
 */
export async function getCashboxHistory(filters?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  limit?: number;
}) {
  try {
    const where: any = {
      entity: 'CASHBOX',
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

    return logs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      entityId: log.entityId,
      details: log.changes ? JSON.parse(log.changes) : null,
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Get cashbox history error:', error);
    return [];
  }
}

/**
 * Kassa statistikasini olish
 */
export async function getCashboxAuditStats(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {
      entity: 'CASHBOX',
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
        WITHDRAW: 0,
        TRANSFER: 0,
        EDIT: 0,
        DELETE: 0,
        VIEW: 0,
      },
      totalAmount: {
        added: 0,
        withdrawn: 0,
        transferred: 0,
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

      // Type va amount bo'yicha
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const type = changes.details?.type;
          const amount = changes.details?.amount || 0;

          if (type && stats.byType.hasOwnProperty(type)) {
            stats.byType[type as keyof typeof stats.byType]++;
          }

          if (type === 'ADD') {
            stats.totalAmount.added += amount;
          } else if (type === 'WITHDRAW') {
            stats.totalAmount.withdrawn += amount;
          } else if (type === 'TRANSFER') {
            stats.totalAmount.transferred += amount;
          }
        } catch (e) {}
      }
    });

    return stats;
  } catch (error) {
    console.error('Get cashbox audit stats error:', error);
    return null;
  }
}

/**
 * Muayyan tranzaksiya tarixini olish
 */
export async function getTransactionHistory(entityId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'CASHBOX',
        entityId,
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
      orderBy: { createdAt: 'asc' },
    });

    return logs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      details: log.changes ? JSON.parse(log.changes) : null,
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Get transaction history error:', error);
    return [];
  }
}

/**
 * Kassa o'zgarishlarini taqqoslash
 */
export async function compareCashboxChanges(entityId: string) {
  try {
    const history = await getTransactionHistory(entityId);
    
    if (history.length < 2) {
      return null;
    }

    const changes = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];

      changes.push({
        from: prev,
        to: curr,
        timestamp: curr.createdAt,
        user: curr.user,
        differences: {
          action: prev.action !== curr.action ? { old: prev.action, new: curr.action } : null,
          details: JSON.stringify(prev.details) !== JSON.stringify(curr.details) 
            ? { old: prev.details, new: curr.details } 
            : null,
        },
      });
    }

    return changes;
  } catch (error) {
    console.error('Compare cashbox changes error:', error);
    return null;
  }
}

/**
 * Shubhali faoliyatni aniqlash
 */
export async function detectSuspiciousActivity(userId?: string) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: any = {
      entity: 'CASHBOX',
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
      amount?: number;
      logId?: string;
      time?: Date;
      severity: string;
    }> = [];

    // Bir xil foydalanuvchidan ko'p tranzaksiyalar
    const userCounts: Record<string, number> = {};
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > 50) {
        const user = logs.find(l => l.userId === userId)?.user;
        suspicious.push({
          type: 'HIGH_FREQUENCY',
          message: `${user?.name} 24 soat ichida ${count} ta tranzaksiya amalga oshirdi`,
          userId,
          count,
          severity: 'WARNING',
        });
      }
    });

    // Katta summa tranzaksiyalari
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const amount = changes.details?.amount || 0;
          
          if (amount > 10000) {
            suspicious.push({
              type: 'LARGE_AMOUNT',
              message: `${log.user.name} katta summa (${amount} USD) tranzaksiya qildi`,
              userId: log.userId,
              amount,
              logId: log.id,
              severity: 'HIGH',
            });
          }
        } catch (e) {}
      }
    });

    // Tunda tranzaksiyalar (22:00 - 06:00)
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      if (hour >= 22 || hour < 6) {
        suspicious.push({
          type: 'NIGHT_ACTIVITY',
          message: `${log.user.name} tunda (${hour}:00) tranzaksiya qildi`,
          userId: log.userId,
          time: log.createdAt,
          logId: log.id,
          severity: 'MEDIUM',
        });
      }
    });

    return suspicious;
  } catch (error) {
    console.error('Detect suspicious activity error:', error);
    return [];
  }
}
