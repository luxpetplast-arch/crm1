import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SalesAuditData {
  userId: string;
  userName: string;
  action: string;
  entity: 'SALES';
  entityId: string;
  customerId?: string;
  customerName?: string;
  details: {
    type: 'CREATE' | 'EDIT' | 'DELETE' | 'PAYMENT' | 'CANCEL' | 'VIEW';
    totalAmount?: number;
    paidAmount?: number;
    currency?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    products?: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    notes?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Savdo harakatini audit logga yozish
 */
export async function logSalesAction(data: SalesAuditData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: JSON.stringify({
          userName: data.userName,
          customerId: data.customerId,
          customerName: data.customerName,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Sales audit log error:', error);
  }
}

/**
 * Savdo tarixini olish
 */
export async function getSalesHistory(filters?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  customerId?: string;
  action?: string;
  limit?: number;
}) {
  try {
    const where: any = {
      entity: 'SALES',
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

    // CustomerId bo'yicha filtrlash (changes ichida)
    let filteredLogs = logs;
    if (filters?.customerId) {
      filteredLogs = logs.filter(log => {
        if (log.changes) {
          try {
            const changes = JSON.parse(log.changes);
            return changes.customerId === filters.customerId;
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
    console.error('Get sales history error:', error);
    return [];
  }
}

/**
 * Savdo statistikasini olish
 */
export async function getSalesAuditStats(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {
      entity: 'SALES',
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
        CREATE: 0,
        EDIT: 0,
        DELETE: 0,
        PAYMENT: 0,
        CANCEL: 0,
        VIEW: 0,
      },
      byCustomer: {} as Record<string, { name: string; count: number }>,
      totalAmount: {
        sales: 0,
        payments: 0,
        cancelled: 0,
      },
      byPaymentStatus: {
        PAID: 0,
        PARTIAL: 0,
        UNPAID: 0,
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

      // Type, customer va amount bo'yicha
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const type = changes.details?.type;
          const customerId = changes.customerId;
          const customerName = changes.customerName;
          const totalAmount = changes.details?.totalAmount || 0;
          const paidAmount = changes.details?.paidAmount || 0;
          const paymentStatus = changes.details?.paymentStatus;

          if (type && stats.byType.hasOwnProperty(type)) {
            stats.byType[type as keyof typeof stats.byType]++;
          }

          if (customerId && customerName) {
            if (!stats.byCustomer[customerId]) {
              stats.byCustomer[customerId] = {
                name: customerName,
                count: 0,
              };
            }
            stats.byCustomer[customerId].count++;
          }

          if (type === 'CREATE') {
            stats.totalAmount.sales += totalAmount;
          } else if (type === 'PAYMENT') {
            stats.totalAmount.payments += paidAmount;
          } else if (type === 'CANCEL') {
            stats.totalAmount.cancelled += totalAmount;
          }

          if (paymentStatus && stats.byPaymentStatus.hasOwnProperty(paymentStatus)) {
            stats.byPaymentStatus[paymentStatus as keyof typeof stats.byPaymentStatus]++;
          }
        } catch (e) {}
      }
    });

    return stats;
  } catch (error) {
    console.error('Get sales audit stats error:', error);
    return null;
  }
}

/**
 * Mijoz savdo tarixini olish
 */
export async function getCustomerSalesHistory(customerId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'SALES',
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

    // CustomerId bo'yicha filtrlash
    const customerLogs = logs.filter(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          return changes.customerId === customerId;
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    return customerLogs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      details: log.changes ? JSON.parse(log.changes) : null,
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Get customer sales history error:', error);
    return [];
  }
}

/**
 * Shubhali savdo faoliyatini aniqlash
 */
export async function detectSuspiciousSalesActivity(userId?: string) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: any = {
      entity: 'SALES',
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
      customerName?: string;
      severity: string;
    }> = [];

    // Bir xil foydalanuvchidan ko'p savdolar
    const userCounts: Record<string, number> = {};
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > 100) { // 50 dan 100 ga oshirdik
        const user = logs.find(l => l.userId === userId)?.user;
        suspicious.push({
          type: 'HIGH_FREQUENCY',
          message: `${user?.name} 24 soat ichida ${count} ta savdo amalga oshirdi`,
          userId,
          count,
          severity: 'WARNING',
        });
      }
    });

    // Katta summa savdolar
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const totalAmount = changes.details?.totalAmount || 0;
          const customerName = changes.customerName;
          
          if (totalAmount > 50000) {
            suspicious.push({
              type: 'LARGE_AMOUNT',
              message: `${log.user.name} katta summa ($${totalAmount}) savdo qildi${customerName ? ` - ${customerName}` : ''}`,
              userId: log.userId,
              amount: totalAmount,
              customerName,
              logId: log.id,
              severity: 'HIGH',
            });
          }
        } catch (e) {}
      }
    });

    // Tunda savdolar (22:00 - 06:00)
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      if (hour >= 22 || hour < 6) {
        let customerName = '';
        if (log.changes) {
          try {
            const changes = JSON.parse(log.changes);
            customerName = changes.customerName || '';
          } catch (e) {}
        }
        
        suspicious.push({
          type: 'NIGHT_ACTIVITY',
          message: `${log.user.name} tunda (${hour}:00) savdo qildi${customerName ? ` - ${customerName}` : ''}`,
          userId: log.userId,
          time: log.createdAt,
          customerName,
          logId: log.id,
          severity: 'MEDIUM',
        });
      }
    });

    // Tez-tez bekor qilishlar
    const cancelCounts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          if (changes.details?.type === 'CANCEL') {
            cancelCounts[log.userId] = (cancelCounts[log.userId] || 0) + 1;
          }
        } catch (e) {}
      }
    });

    Object.entries(cancelCounts).forEach(([userId, count]) => {
      if (count > 5) {
        const user = logs.find(l => l.userId === userId)?.user;
        suspicious.push({
          type: 'FREQUENT_CANCELLATIONS',
          message: `${user?.name} 24 soat ichida ${count} marta savdoni bekor qildi`,
          userId,
          count,
          severity: 'WARNING',
        });
      }
    });

    // Bir xil mijozga ko'p savdolar
    const customerCounts: Record<string, { count: number; name: string }> = {};
    logs.forEach(log => {
      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const customerId = changes.customerId;
          const customerName = changes.customerName;
          if (customerId && changes.details?.type === 'CREATE') {
            if (!customerCounts[customerId]) {
              customerCounts[customerId] = { count: 0, name: customerName || '' };
            }
            customerCounts[customerId].count++;
          }
        } catch (e) {}
      }
    });

    Object.entries(customerCounts).forEach(([customerId, data]) => {
      if (data.count > 10) {
        suspicious.push({
          type: 'FREQUENT_CUSTOMER_SALES',
          message: `${data.name} mijozga 24 soat ichida ${data.count} ta savdo qilindi`,
          count: data.count,
          customerName: data.name,
          severity: 'INFO',
        });
      }
    });

    return suspicious;
  } catch (error) {
    console.error('Detect suspicious sales activity error:', error);
    return [];
  }
}

/**
 * Savdo trend tahlili
 */
export async function getSalesTrend(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'SALES',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Kunlik trend
    const dailyTrend: Array<{
      date: string;
      sales: number;
      amount: number;
      payments: number;
      cancelled: number;
    }> = [];

    const dateMap: Record<string, any> = {};

    logs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          sales: 0,
          amount: 0,
          payments: 0,
          cancelled: 0,
        };
      }

      if (log.changes) {
        try {
          const changes = JSON.parse(log.changes);
          const type = changes.details?.type;
          const totalAmount = changes.details?.totalAmount || 0;
          const paidAmount = changes.details?.paidAmount || 0;

          if (type === 'CREATE') {
            dateMap[date].sales++;
            dateMap[date].amount += totalAmount;
          } else if (type === 'PAYMENT') {
            dateMap[date].payments += paidAmount;
          } else if (type === 'CANCEL') {
            dateMap[date].cancelled++;
          }
        } catch (e) {}
      }
    });

    Object.values(dateMap).forEach(data => {
      dailyTrend.push(data);
    });

    return dailyTrend.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Get sales trend error:', error);
    return [];
  }
}
