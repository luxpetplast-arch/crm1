import { prisma } from '../utils/prisma';

interface SalesIntelligence {
  salesTrends: any;
  customerBehavior: any;
  productRecommendations: any;
  optimalPricing: any;
  employeePerformance: any;
  alerts: any[];
  predictions: any;
  insights: string[];
}

/**
 * AI SALES INTELLIGENCE - Savdo tahlili
 */
export async function generateSalesIntelligence(): Promise<SalesIntelligence> {
  try {
    const sales = await prisma.sale.findMany({
      include: { customer: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const customers = await prisma.customer.findMany({
      include: { _count: { select: { sales: true } } }
    });

    const products = await prisma.product.findMany();

    // Oddiy tahlil
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      salesTrends: {
        totalRevenue,
        avgOrderValue,
        totalSales: sales.length
      },
      customerBehavior: {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c._count.sales > 0).length
      },
      productRecommendations: products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        stock: p.currentStock
      })),
      optimalPricing: {},
      employeePerformance: {},
      alerts: [],
      predictions: {},
      insights: [
        `Jami daromad: $${totalRevenue.toFixed(2)}`,
        `O'rtacha buyurtma: $${avgOrderValue.toFixed(2)}`,
        `Jami mijozlar: ${customers.length}`
      ]
    };
  } catch (error) {
    console.error('Sales intelligence error:', error);
    return {
      salesTrends: {},
      customerBehavior: {},
      productRecommendations: [],
      optimalPricing: {},
      employeePerformance: {},
      alerts: [],
      predictions: {},
      insights: []
    };
  }
}
