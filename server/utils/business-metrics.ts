import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. SAVDO METRIKALARI
export interface SalesMetrics {
  salesVolume: number;
  revenue: number;
  averageOrderValue: number;
  salesGrowthRate: number;
  salesPerCustomer: number;
  salesPerDay: number;
  conversionRate: number;
  repeatPurchaseRate: number;
}

export async function calculateSalesMetrics(startDate: Date, endDate: Date): Promise<SalesMetrics> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);
  
  const prevSales = await prisma.sale.findMany({
    where: { createdAt: { gte: prevStartDate, lt: startDate } },
  });

  const customers = await prisma.customer.findMany();
  const activeCustomers = new Set(sales.map(s => s.customerId)).size;

  const salesVolume = sales.reduce((sum, s) => sum + s.quantity, 0);
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const prevRevenue = prevSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const customerPurchases = sales.reduce((acc: any, sale) => {
    acc[sale.customerId] = (acc[sale.customerId] || 0) + 1;
    return acc;
  }, {});
  const repeatCustomers = Object.values(customerPurchases).filter((count: any) => count > 1).length;

  return {
    salesVolume,
    revenue,
    averageOrderValue: sales.length > 0 ? revenue / sales.length : 0,
    salesGrowthRate: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
    salesPerCustomer: activeCustomers > 0 ? revenue / activeCustomers : 0,
    salesPerDay: days > 0 ? revenue / days : 0,
    conversionRate: customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0,
    repeatPurchaseRate: activeCustomers > 0 ? (repeatCustomers / activeCustomers) * 100 : 0,
  };
}

// 2. MAHSULOT METRIKALARI
export interface ProductMetrics {
  costOfGoodsSold: number;
  unitCost: number;
  unitProfit: number;
  grossProfit: number;
  grossMargin: number;
  contributionMargin: number;
  inventoryTurnover: number;
  stockDays: number;
}

export async function calculateProductMetrics(startDate: Date, endDate: Date): Promise<ProductMetrics> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: { product: true },
  });

  const products = await prisma.product.findMany();

  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = sales.reduce((sum, s) => {
    const cost = s.product?.productionCost || 0;
    return sum + (cost * s.quantity);
  }, 0);

  const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const avgStock = (totalStock + totalQuantitySold) / 2;

  const grossProfit = revenue - totalCost;
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    costOfGoodsSold: totalCost,
    unitCost: totalQuantitySold > 0 ? totalCost / totalQuantitySold : 0,
    unitProfit: totalQuantitySold > 0 ? grossProfit / totalQuantitySold : 0,
    grossProfit,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    contributionMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    inventoryTurnover: avgStock > 0 ? totalCost / avgStock : 0,
    stockDays: avgStock > 0 ? (avgStock / totalCost) * days : 0,
  };
}

// 3. FOYDA VA RENTABELLIK
export interface ProfitabilityMetrics {
  netProfit: number;
  netProfitMargin: number;
  operatingProfit: number;
  operatingMargin: number;
  roi: number;
  breakEvenPoint: number;
  contributionPerUnit: number;
}

export async function calculateProfitabilityMetrics(startDate: Date, endDate: Date): Promise<ProfitabilityMetrics> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: { product: true },
  });

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = sales.reduce((sum, s) => {
    const cost = s.product?.productionCost || 0;
    return sum + (cost * s.quantity);
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const grossProfit = revenue - totalCost;
  const operatingProfit = grossProfit - totalExpenses;
  const netProfit = operatingProfit;

  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const fixedCosts = totalExpenses;
  const variableCostPerUnit = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  const avgSellingPrice = totalQuantity > 0 ? revenue / totalQuantity : 0;

  return {
    netProfit,
    netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    operatingProfit,
    operatingMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
    roi: (totalCost + totalExpenses) > 0 ? (netProfit / (totalCost + totalExpenses)) * 100 : 0,
    breakEvenPoint: (avgSellingPrice - variableCostPerUnit) > 0 ? fixedCosts / (avgSellingPrice - variableCostPerUnit) : 0,
    contributionPerUnit: avgSellingPrice - variableCostPerUnit,
  };
}

// 4. MARKETING VA MIJOZLAR
export interface MarketingMetrics {
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  ltvCacRatio: number;
  customerRetentionRate: number;
  churnRate: number;
  marketingROI: number;
}

export async function calculateMarketingMetrics(startDate: Date, endDate: Date): Promise<MarketingMetrics> {
  const customers = await prisma.customer.findMany({
    include: { sales: true },
  });

  const newCustomers = customers.filter(c => c.createdAt >= startDate && c.createdAt <= endDate);
  
  const expenses = await prisma.expense.findMany({
    where: { 
      createdAt: { gte: startDate, lte: endDate },
      category: 'MARKETING'
    },
  });

  const marketingCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cac = newCustomers.length > 0 ? marketingCost / newCustomers.length : 0;

  const avgCustomerRevenue = customers.length > 0 
    ? customers.reduce((sum, c) => sum + c.sales.reduce((s, sale) => s + sale.totalAmount, 0), 0) / customers.length 
    : 0;

  const avgCustomerLifespan = 3;
  const ltv = avgCustomerRevenue * avgCustomerLifespan;

  const prevStartDate = new Date(startDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const prevCustomers = customers.filter(c => c.createdAt < startDate);
  const retainedCustomers = prevCustomers.filter(c => 
    c.sales.some(s => s.createdAt >= startDate && s.createdAt <= endDate)
  ).length;

  const retentionRate = prevCustomers.length > 0 ? (retainedCustomers / prevCustomers.length) * 100 : 0;

  return {
    customerAcquisitionCost: cac,
    customerLifetimeValue: ltv,
    ltvCacRatio: cac > 0 ? ltv / cac : 0,
    customerRetentionRate: retentionRate,
    churnRate: 100 - retentionRate,
    marketingROI: marketingCost > 0 ? ((avgCustomerRevenue - marketingCost) / marketingCost) * 100 : 0,
  };
}

// 5. QARZDORLIK
export interface DebtMetrics {
  totalDebt: number;
  debtRatio: number;
  accountsReceivable: number;
  receivableTurnover: number;
  daysSalesOutstanding: number;
  badDebtRatio: number;
}

export async function calculateDebtMetrics(startDate: Date, endDate: Date): Promise<DebtMetrics> {
  const customers = await prisma.customer.findMany({
    include: { sales: true },
  });

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const accountsReceivable = totalDebt;
  const receivableTurnover = accountsReceivable > 0 ? revenue / accountsReceivable : 0;
  const dso = receivableTurnover > 0 ? days / receivableTurnover : 0;

  const highDebtCustomers = customers.filter(c => c.debt > 10000).length;
  const badDebtRatio = customers.length > 0 ? (highDebtCustomers / customers.length) * 100 : 0;

  return {
    totalDebt,
    debtRatio: revenue > 0 ? (totalDebt / revenue) * 100 : 0,
    accountsReceivable,
    receivableTurnover,
    daysSalesOutstanding: dso,
    badDebtRatio,
  };
}

// 6. PUL OQIMI
export interface CashFlowMetrics {
  operatingCashFlow: number;
  freeCashFlow: number;
  cashConversionCycle: number;
}

export async function calculateCashFlowMetrics(startDate: Date, endDate: Date): Promise<CashFlowMetrics> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const cashbox = await prisma.cashboxTransaction.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cashIn = cashbox.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = cashbox.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

  const operatingCashFlow = cashIn - cashOut;
  const freeCashFlow = operatingCashFlow - totalExpenses;

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const cashConversionCycle = days;

  return {
    operatingCashFlow,
    freeCashFlow,
    cashConversionCycle,
  };
}

// 7. OPERATSION SAMARADORLIK
export interface OperationalMetrics {
  employeeProductivity: number;
  revenuePerEmployee: number;
  orderFulfillmentTime: number;
  onTimeDeliveryRate: number;
}

export async function calculateOperationalMetrics(startDate: Date, endDate: Date): Promise<OperationalMetrics> {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const employeeCount = 5;

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const avgFulfillmentTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, o) => {
        const time = o.updatedAt.getTime() - o.createdAt.getTime();
        return sum + time;
      }, 0) / completedOrders.length / (1000 * 60 * 60)
    : 0;

  return {
    employeeProductivity: employeeCount > 0 ? sales.length / employeeCount : 0,
    revenuePerEmployee: employeeCount > 0 ? revenue / employeeCount : 0,
    orderFulfillmentTime: avgFulfillmentTime,
    onTimeDeliveryRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
  };
}

// 8. STRATEGIK O'SISH
export interface GrowthMetrics {
  customerGrowthRate: number;
  productGrowthRate: number;
  newVsReturningCustomers: { new: number; returning: number };
}

export async function calculateGrowthMetrics(startDate: Date, endDate: Date): Promise<GrowthMetrics> {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const customers = await prisma.customer.findMany();
  const currentCustomers = customers.filter(c => c.createdAt >= startDate && c.createdAt <= endDate);
  const prevCustomers = customers.filter(c => c.createdAt >= prevStartDate && c.createdAt < startDate);

  const products = await prisma.product.findMany();
  const currentProducts = products.filter(p => p.createdAt >= startDate && p.createdAt <= endDate);
  const prevProducts = products.filter(p => p.createdAt >= prevStartDate && p.createdAt < startDate);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const newCustomerIds = currentCustomers.map(c => c.id);
  const newCustomerSales = sales.filter(s => newCustomerIds.includes(s.customerId)).length;
  const returningCustomerSales = sales.length - newCustomerSales;

  return {
    customerGrowthRate: prevCustomers.length > 0 
      ? ((currentCustomers.length - prevCustomers.length) / prevCustomers.length) * 100 
      : 0,
    productGrowthRate: prevProducts.length > 0 
      ? ((currentProducts.length - prevProducts.length) / prevProducts.length) * 100 
      : 0,
    newVsReturningCustomers: {
      new: newCustomerSales,
      returning: returningCustomerSales,
    },
  };
}

// BARCHA METRIKALARNI BIRLASHTIRISH
export interface AllBusinessMetrics {
  sales: SalesMetrics;
  product: ProductMetrics;
  profitability: ProfitabilityMetrics;
  marketing: MarketingMetrics;
  debt: DebtMetrics;
  cashFlow: CashFlowMetrics;
  operational: OperationalMetrics;
  growth: GrowthMetrics;
}

export async function calculateAllMetrics(days: number = 30): Promise<AllBusinessMetrics> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [sales, product, profitability, marketing, debt, cashFlow, operational, growth] = await Promise.all([
    calculateSalesMetrics(startDate, endDate),
    calculateProductMetrics(startDate, endDate),
    calculateProfitabilityMetrics(startDate, endDate),
    calculateMarketingMetrics(startDate, endDate),
    calculateDebtMetrics(startDate, endDate),
    calculateCashFlowMetrics(startDate, endDate),
    calculateOperationalMetrics(startDate, endDate),
    calculateGrowthMetrics(startDate, endDate),
  ]);

  return {
    sales,
    product,
    profitability,
    marketing,
    debt,
    cashFlow,
    operational,
    growth,
  };
}
