import { prisma } from './prisma';
import * as XLSX from 'xlsx';
import type { Response } from 'express';

export interface ExportOptions {
  format?: 'json' | 'excel' | 'csv';
  includeRelations?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    status?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

// Mahsulotlarni eksport qilish
export async function exportProducts(options: ExportOptions = {}) {
  try {
    const { format = 'json', includeRelations = false, dateRange, filters } = options;

    // Mahsulotlarni olish
    let products = await prisma.product.findMany({
      include: {
        ...(includeRelations && {
          batches: {
            take: 5,
            orderBy: { productionDate: 'desc' }
          },
          stockAlerts: {
            where: { resolved: false },
            take: 3
          },
          stockMovements: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        })
      },
      orderBy: { name: 'asc' }
    });

    // Filtrlash
    if (filters?.status) {
      products = products.filter(p => {
        if (filters.status === 'low_stock') return p.currentStock <= p.minStockLimit;
        if (filters.status === 'out_of_stock') return p.currentStock === 0;
        if (filters.status === 'normal') return p.currentStock > p.minStockLimit;
        return true;
      });
    }

    // Sana bo'yicha filtrlash
    if (dateRange) {
      products = products.filter(p => 
        p.createdAt >= dateRange.start && p.createdAt <= dateRange.end
      );
    }

    // Ma'lumotlarni formatlash
    const exportData = products.map(product => {
      const baseData = {
        ID: product.id,
        Nomi: product.name,
        'Qop turi': product.bagType,
        'Qopdagi donalar soni': product.unitsPerBag,
        'Minimal zaxira': product.minStockLimit,
        'Optimal zaxira': product.optimalStock,
        'Maksimal sig\'im': product.maxCapacity,
        'Joriy zaxira (qop)': product.currentStock,
        'Joriy zaxira (dona)': product.currentUnits,
        'Narx qop uchun': product.pricePerBag,
        'Ishlab chiqarish narxi': product.productionCost,
        'Yaratilgan sana': new Date(product.createdAt).toLocaleDateString('uz-UZ'),
        'Yangilangan sana': new Date(product.updatedAt).toLocaleDateString('uz-UZ')
      };

      if (includeRelations) {
        return {
          ...baseData,
          'Partiyalar soni': product.batches?.length || 0,
          'Ogohlantirishlar soni': product.stockAlerts?.length || 0,
          'Harakatlar soni': product.stockMovements?.length || 0,
          'Ohirgi partiya': product.batches?.[0]?.productionDate ? 
            new Date(product.batches[0].productionDate).toLocaleDateString('uz-UZ') : 'Yo\'q'
        };
      }

      return baseData;
    });

    // Formatga qarab eksport qilish
    switch (format) {
      case 'excel':
        return exportToExcel(exportData, 'mahsulotlar');
      case 'csv':
        return exportToCSV(exportData, 'mahsulotlar');
      default:
        return {
          filename: `mahsulotlar_${new Date().toISOString().split('T')[0]}.json`,
          data: JSON.stringify({
            exportDate: new Date().toISOString(),
            total: products.length,
            products: includeRelations ? products : exportData
          }, null, 2)
        };
    }
  } catch (error) {
    console.error('Mahsulotlarni eksport qilish xatolik:', error);
    throw new Error('Mahsulotlarni eksport qilishda xatolik yuz berdi');
  }
}

// Mijozlarni eksport qilish
export async function exportCustomers(options: ExportOptions = {}) {
  try {
    const { format = 'json', includeRelations = false, dateRange, filters } = options;

    // Mijozlarni olish
    let customers = await prisma.customer.findMany({
      include: {
        ...(includeRelations && {
          sales: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        })
      },
      orderBy: { name: 'asc' }
    });

    // Filtrlash
    if (filters?.category) {
      customers = customers.filter(c => c.category === filters.category);
    }

    if (filters?.minAmount !== undefined) {
      customers = customers.filter(c => c.debt >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      customers = customers.filter(c => c.debt <= filters.maxAmount!);
    }

    // Sana bo'yicha filtrlash
    if (dateRange) {
      customers = customers.filter(c => 
        c.createdAt >= dateRange.start && c.createdAt <= dateRange.end
      );
    }

    // Ma'lumotlarni formatlash
    const exportData = customers.map(customer => {
      const baseData = {
        ID: customer.id,
        'Ismi': customer.name,
        'Email': customer.email || '',
        'Telefon': customer.phone,
        'Manzil': customer.address || '',
        'Telegram Chat ID': customer.telegramChatId || '',
        'Telegram username': customer.telegramUsername || '',
        'Eslatmalar yoqilgan': customer.notificationsEnabled ? 'Ha' : 'Yo\'q',
        'Qarz eslatma kunlari': customer.debtReminderDays,
        'To\'lov muddati (kun)': customer.paymentTermDays,
        'Chegirma foizi': customer.discountPercent,
        'Balans': customer.balance,
        'Qarz': customer.debt,
        'Kredit limiti': customer.creditLimit,
        'Kategoriya': customer.category,
        'Ohirgi xarid': customer.lastPurchase ? 
          new Date(customer.lastPurchase).toLocaleDateString('uz-UZ') : 'Yo\'q',
        'Ohirgi to\'lov': customer.lastPayment ? 
          new Date(customer.lastPayment).toLocaleDateString('uz-UZ') : 'Yo\'q',
        'Yaratilgan sana': new Date(customer.createdAt).toLocaleDateString('uz-UZ'),
        'Yangilangan sana': new Date(customer.updatedAt).toLocaleDateString('uz-UZ')
      };

      if (includeRelations) {
        const totalSales = customer.sales?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
        const totalPayments = customer.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        
        return {
          ...baseData,
          'Jami sotuvlar soni': customer.sales?.length || 0,
          'Jami sotuv summasi': totalSales,
          'To\'lovlar soni': customer.payments?.length || 0,
          'Jami to\'lov summasi': totalPayments,
          'Buyurtmalar soni': customer.orders?.length || 0,
          'Faol buyurtmalar': customer.orders?.filter(o => 
            !['DELIVERED', 'CANCELLED'].includes(o.status)
          ).length || 0
        };
      }

      return baseData;
    });

    // Formatga qarab eksport qilish
    switch (format) {
      case 'excel':
        return exportToExcel(exportData, 'mijozlar');
      case 'csv':
        return exportToCSV(exportData, 'mijozlar');
      default:
        return {
          filename: `mijozlar_${new Date().toISOString().split('T')[0]}.json`,
          data: JSON.stringify({
            exportDate: new Date().toISOString(),
            total: customers.length,
            customers: includeRelations ? customers : exportData
          }, null, 2)
        };
    }
  } catch (error) {
    console.error('Mijozlarni eksport qilish xatolik:', error);
    throw new Error('Mijozlarni eksport qilishda xatolik yuz berdi');
  }
}

// Excel formatida eksport qilish
function exportToExcel(data: any[], sheetName: string): { filename: string; data: Buffer } {
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, {
      header: Object.keys(data[0] || {}),
      cellStyles: true
    });

    // Ustun kengliklarini sozlash
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return {
      filename: `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`,
      data: excelBuffer
    };
  } catch (error) {
    console.error('Excel eksport xatolik:', error);
    throw new Error('Excel formatida eksport qilishda xatolik');
  }
}

// CSV formatida eksport qilish
function exportToCSV(data: any[], sheetName: string): { filename: string; data: string } {
  try {
    const csv = XLSX.utils.sheet_to_csv(
      XLSX.utils.json_to_sheet(data, {
        header: Object.keys(data[0] || {})
      })
    );

    return {
      filename: `${sheetName}_${new Date().toISOString().split('T')[0]}.csv`,
      data: csv
    };
  } catch (error) {
    console.error('CSV eksport xatolik:', error);
    throw new Error('CSV formatida eksport qilishda xatolik');
  }
}

// Response yuborish
export function sendExportResponse(res: Response, result: { filename: string; data: any }, format: string) {
  const contentType = format === 'excel' ? 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
    format === 'csv' ? 'text/csv' : 'application/json';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`);
  
  if (format === 'excel') {
    res.send(result.data);
  } else {
    res.send(result.data);
  }
}

// Umumiy statistika
export async function getExportStatistics() {
  try {
    const [
      totalProducts,
      totalCustomers,
      lowStockProducts,
      outOfStockProducts,
      customersWithDebt,
      activeCustomers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { currentStock: { lte: 10 } } }),
      prisma.product.count({ where: { currentStock: 0 } }),
      prisma.customer.count({ where: { debt: { gt: 0 } } }),
      prisma.customer.count({ 
        where: { 
          lastPurchase: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      })
    ]);

    return {
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        normal: totalProducts - lowStockProducts - outOfStockProducts
      },
      customers: {
        total: totalCustomers,
        withDebt: customersWithDebt,
        active: activeCustomers,
        inactive: totalCustomers - activeCustomers
      },
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Statistikani olish xatolik:', error);
    throw new Error('Statistikani olishda xatolik');
  }
}
