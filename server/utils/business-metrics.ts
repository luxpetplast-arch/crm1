import { prisma } from './prisma';
import { safeDivide, safePercentage, safeParseFloat, safeAverage, safeSum } from './safe-math';

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

  const customerPurchases = sales.reduce((acc: Record<string, number>, sale) => {
    const key = sale.customerId || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const repeatCustomers = Object.values(customerPurchases).filter((count: any) => count > 1).length;

  return {
    salesVolume,
    revenue,
    averageOrderValue: safeDivide(revenue, sales.length, 0),
    salesGrowthRate: safePercentage(revenue - prevRevenue, prevRevenue, 0),
    salesPerCustomer: safeDivide(revenue, activeCustomers, 0),
    salesPerDay: safeDivide(revenue, days, 0),
    conversionRate: safePercentage(activeCustomers, customers.length, 0),
    repeatPurchaseRate: safePercentage(repeatCustomers, activeCustomers, 0),
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
    unitCost: safeDivide(totalCost, totalQuantitySold, 0),
    unitProfit: safeDivide(grossProfit, totalQuantitySold, 0),
    grossProfit,
    grossMargin: safePercentage(grossProfit, revenue, 0),
    contributionMargin: safePercentage(grossProfit, revenue, 0),
    inventoryTurnover: safeDivide(totalCost, avgStock, 0),
    stockDays: safeDivide(avgStock, totalCost, 0) * days,
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
  const variableCostPerUnit = safeDivide(totalCost, totalQuantity, 0);
  const avgSellingPrice = safeDivide(revenue, totalQuantity, 0);
  const contributionPerUnit = avgSellingPrice - variableCostPerUnit;

  return {
    netProfit,
    netProfitMargin: safePercentage(netProfit, revenue, 0),
    operatingProfit,
    operatingMargin: safePercentage(operatingProfit, revenue, 0),
    roi: safePercentage(netProfit, totalCost + totalExpenses, 0),
    breakEvenPoint: safeDivide(fixedCosts, contributionPerUnit, 0),
    contributionPerUnit,
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
  const cac = safeDivide(marketingCost, newCustomers.length, 0);

  const totalCustomerRevenue = customers.reduce((sum, c) => 
    sum + c.sales.reduce((s, sale) => s + sale.totalAmount, 0), 0);
  const avgCustomerRevenue = safeDivide(totalCustomerRevenue, customers.length, 0);

  const avgCustomerLifespan = 3;
  const ltv = avgCustomerRevenue * avgCustomerLifespan;

  const prevStartDate = new Date(startDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const prevCustomers = customers.filter(c => c.createdAt < startDate);
  const retainedCustomers = prevCustomers.filter(c => 
    c.sales.some(s => s.createdAt >= startDate && s.createdAt <= endDate)
  ).length;

  const retentionRate = safePercentage(retainedCustomers, prevCustomers.length, 0);

  return {
    customerAcquisitionCost: cac,
    customerLifetimeValue: ltv,
    ltvCacRatio: safeDivide(ltv, cac, 0),
    customerRetentionRate: retentionRate,
    churnRate: 100 - retentionRate,
    marketingROI: safePercentage(avgCustomerRevenue - marketingCost, marketingCost, 0),
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
  const receivableTurnover = safeDivide(revenue, accountsReceivable, 0);
  const dso = safeDivide(days, receivableTurnover, 0);

  const highDebtCustomers = customers.filter(c => c.debt > 10000).length;
  const badDebtRatio = safePercentage(highDebtCustomers, customers.length, 0);

  return {
    totalDebt,
    debtRatio: safePercentage(totalDebt, revenue, 0),
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
  const totalFulfillmentTime = completedOrders.reduce((sum, o) => {
    const time = o.updatedAt.getTime() - o.createdAt.getTime();
    return sum + time;
  }, 0);
  const avgFulfillmentTime = safeDivide(totalFulfillmentTime, completedOrders.length, 0) / (1000 * 60 * 60);

  return {
    employeeProductivity: safeDivide(sales.length, employeeCount, 0),
    revenuePerEmployee: safeDivide(revenue, employeeCount, 0),
    orderFulfillmentTime: avgFulfillmentTime,
    onTimeDeliveryRate: safePercentage(completedOrders.length, orders.length, 0),
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
  const newCustomerSales = sales.filter(s => s.customerId && newCustomerIds.includes(s.customerId)).length;
  const returningCustomerSales = sales.length - newCustomerSales;

  return {
    customerGrowthRate: safePercentage(currentCustomers.length - prevCustomers.length, prevCustomers.length, 0),
    productGrowthRate: safePercentage(currentProducts.length - prevProducts.length, prevProducts.length, 0),
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
