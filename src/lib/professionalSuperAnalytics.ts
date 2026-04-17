// Professional Super Analytics System - 65 Business Formulas

// Metric Categories
export enum MetricCategory {
  SALES = 'sales',
  PRODUCT = 'product',
  PROFITABILITY = 'profitability',
  MARKETING = 'marketing',
  DEBT = 'debt',
  CASH_FLOW = 'cash_flow',
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
}

// Metric Types
export enum MetricType {
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  RATIO = 'ratio',
  COUNT = 'count',
  DAYS = 'days',
  RATE = 'rate',
  SCORE = 'score',
  TIME = 'time',
}

// Time Periods
export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

// Data Sources
export enum DataSource {
  SALES = 'sales',
  INVENTORY = 'inventory',
  CUSTOMERS = 'customers',
  MARKETING = 'marketing',
  FINANCIAL = 'financial',
  OPERATIONS = 'operations',
  HR = 'hr',
}

// Metric Definition
export interface Metric {
  id: string;
  name: string;
  category: MetricCategory;
  type: MetricType;
  formula: string;
  description: string;
  unit: string;
  target?: number;
  benchmark?: number;
  dataSources: DataSource[];
  calculationMethod: (data: any) => number;
  interpretation: {
    good: { min: number; max: number; description: string };
    warning: { min: number; max: number; description: string };
    critical: { min: number; max: number; description: string };
  };
}

// Analytics Result
export interface AnalyticsResult {
  metric: Metric;
  value: number;
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  comparison: {
    previousPeriod: number;
    target: number;
    benchmark: number;
  };
  insights: string[];
  recommendations: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number; // 0-100
}

// Business Data
export interface BusinessData {
  sales: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalVisitors: number;
    repeatCustomers: number;
    newCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    salesGrowthRate: number;
    salesPerCustomer: number;
    salesPerDay: number;
    salesPerEmployee: number;
    repeatPurchaseRate: number;
    revenuePerVisitor: number;
  };
  products: {
    totalProducts: number;
    costOfGoodsSold: number;
    unitCost: number;
    unitPrice: number;
    unitProfit: number;
    grossProfit: number;
    grossMargin: number;
    contributionMargin: number;
    sellThroughRate: number;
    inventoryTurnover: number;
    stockDays: number;
    stockoutRate: number;
    totalInventory: number;
    averageInventory: number;
  };
  profitability: {
    netProfit: number;
    netProfitMargin: number;
    operatingProfit: number;
    operatingMargin: number;
    ebitda: number;
    roi: number;
    roa: number;
    roe: number;
    breakEvenPoint: number;
    contributionPerUnit: number;
    totalExpenses: number;
    operatingExpenses: number;
  };
  marketing: {
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    ltvToCacRatio: number;
    customerRetentionRate: number;
    churnRate: number;
    customerSatisfactionScore: number;
    netPromoterScore: number;
    costPerLead: number;
    leadConversionRate: number;
    marketingRoi: number;
    totalMarketingSpend: number;
    totalLeads: number;
  };
  debt: {
    totalDebt: number;
    totalEquity: number;
    debtRatio: number;
    debtToEquityRatio: number;
    interestCoverageRatio: number;
    defaultRate: number;
    accountsReceivable: number;
    receivableTurnover: number;
    daysSalesOutstanding: number;
    badDebtRatio: number;
    interestExpense: number;
    ebit: number;
  };
  cashFlow: {
    operatingCashFlow: number;
    freeCashFlow: number;
    cashBurnRate: number;
    cashRunway: number;
    cashConversionCycle: number;
    beginningCash: number;
    endingCash: number;
    capitalExpenditures: number;
    workingCapital: number;
  };
  operational: {
    employeeProductivity: number;
    revenuePerEmployee: number;
    costPerEmployee: number;
    orderFulfillmentTime: number;
    returnRate: number;
    defectRate: number;
    onTimeDeliveryRate: number;
    totalEmployees: number;
    totalOrders: number;
    totalReturns: number;
    defectiveProducts: number;
    onTimeDeliveries: number;
  };
  strategic: {
    marketShare: number;
    customerGrowthRate: number;
    productGrowthRate: number;
    expansionRevenue: number;
    newVsReturningCustomers: {
      new: number;
      returning: number;
    };
    totalMarketSize: number;
    competitorRevenue: number;
    newProductRevenue: number;
    existingProductRevenue: number;
  };
}

// Professional Super Analytics Manager
export class ProfessionalSuperAnalyticsManager {
  private static instance: ProfessionalSuperAnalyticsManager;
  private metrics: Map<string, Metric> = new Map();
  private results: Map<string, AnalyticsResult[]> = new Map();

  constructor() {
    this.initializeMetrics();
  }

  static getInstance(): ProfessionalSuperAnalyticsManager {
    if (!ProfessionalSuperAnalyticsManager.instance) {
      ProfessionalSuperAnalyticsManager.instance = new ProfessionalSuperAnalyticsManager();
    }
    return ProfessionalSuperAnalyticsManager.instance;
  }

  // Initialize all 65 metrics
  private initializeMetrics(): void {
    // 1. Sales Metrics (13 formulas)
    this.addMetric({
      id: 'sales_volume',
      name: 'Sales Volume',
      category: MetricCategory.SALES,
      type: MetricType.COUNT,
      formula: 'Total Units Sold',
      description: 'Total number of products sold',
      unit: 'units',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.totalOrders,
      interpretation: {
        good: { min: 1000, max: Infinity, description: 'Excellent sales volume' },
        warning: { min: 500, max: 999, description: 'Moderate sales volume' },
        critical: { min: 0, max: 499, description: 'Low sales volume - needs attention' },
      },
    });

    this.addMetric({
      id: 'revenue',
      name: 'Revenue',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Price × Quantity',
      description: 'Total revenue from sales',
      unit: 'UZS',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.totalRevenue,
      interpretation: {
        good: { min: 100000000, max: Infinity, description: 'Strong revenue performance' },
        warning: { min: 50000000, max: 99999999, description: 'Moderate revenue performance' },
        critical: { min: 0, max: 49999999, description: 'Low revenue - needs improvement' },
      },
    });

    this.addMetric({
      id: 'aov',
      name: 'Average Order Value (AOV)',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Revenue / Orders',
      description: 'Average value per order',
      unit: 'UZS',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.averageOrderValue,
      interpretation: {
        good: { min: 100000, max: Infinity, description: 'High average order value' },
        warning: { min: 50000, max: 99999, description: 'Moderate average order value' },
        critical: { min: 0, max: 49999, description: 'Low average order value' },
      },
    });

    this.addMetric({
      id: 'sales_growth_rate',
      name: 'Sales Growth Rate',
      category: MetricCategory.SALES,
      type: MetricType.PERCENTAGE,
      formula: '(Current Period Sales - Previous Period Sales) / Previous Period Sales × 100',
      description: 'Percentage change in sales over time',
      unit: '%',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.salesGrowthRate,
      interpretation: {
        good: { min: 20, max: Infinity, description: 'Excellent growth rate' },
        warning: { min: 5, max: 19.9, description: 'Moderate growth rate' },
        critical: { min: -Infinity, max: 4.9, description: 'Low or negative growth' },
      },
    });

    this.addMetric({
      id: 'sales_per_customer',
      name: 'Sales per Customer',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Total Revenue / Total Customers',
      description: 'Average revenue generated per customer',
      unit: 'UZS',
      dataSources: [DataSource.SALES, DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.sales.salesPerCustomer,
      interpretation: {
        good: { min: 500000, max: Infinity, description: 'High customer value' },
        warning: { min: 200000, max: 499999, description: 'Moderate customer value' },
        critical: { min: 0, max: 199999, description: 'Low customer value' },
      },
    });

    this.addMetric({
      id: 'sales_per_day',
      name: 'Sales per Day',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Total Revenue / Number of Days',
      description: 'Average daily sales revenue',
      unit: 'UZS',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.salesPerDay,
      interpretation: {
        good: { min: 5000000, max: Infinity, description: 'Strong daily sales' },
        warning: { min: 2000000, max: 4999999, description: 'Moderate daily sales' },
        critical: { min: 0, max: 1999999, description: 'Low daily sales' },
      },
    });

    this.addMetric({
      id: 'sales_per_employee',
      name: 'Sales per Employee',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Total Revenue / Total Employees',
      description: 'Revenue generated per employee',
      unit: 'UZS',
      dataSources: [DataSource.SALES, DataSource.HR],
      calculationMethod: (data: BusinessData) => data.sales.salesPerEmployee,
      interpretation: {
        good: { min: 10000000, max: Infinity, description: 'High employee productivity' },
        warning: { min: 5000000, max: 9999999, description: 'Moderate employee productivity' },
        critical: { min: 0, max: 4999999, description: 'Low employee productivity' },
      },
    });

    this.addMetric({
      id: 'conversion_rate',
      name: 'Conversion Rate',
      category: MetricCategory.SALES,
      type: MetricType.PERCENTAGE,
      formula: '(Orders / Visitors) × 100',
      description: 'Percentage of visitors who make a purchase',
      unit: '%',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.conversionRate,
      interpretation: {
        good: { min: 5, max: Infinity, description: 'Excellent conversion rate' },
        warning: { min: 2, max: 4.9, description: 'Moderate conversion rate' },
        critical: { min: 0, max: 1.9, description: 'Low conversion rate' },
      },
    });

    this.addMetric({
      id: 'repeat_purchase_rate',
      name: 'Repeat Purchase Rate',
      category: MetricCategory.SALES,
      type: MetricType.PERCENTAGE,
      formula: '(Repeat Customers / Total Customers) × 100',
      description: 'Percentage of customers who make repeat purchases',
      unit: '%',
      dataSources: [DataSource.SALES, DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.sales.repeatPurchaseRate,
      interpretation: {
        good: { min: 60, max: Infinity, description: 'Excellent customer loyalty' },
        warning: { min: 30, max: 59.9, description: 'Moderate customer loyalty' },
        critical: { min: 0, max: 29.9, description: 'Low customer loyalty' },
      },
    });

    this.addMetric({
      id: 'revenue_per_visitor',
      name: 'Revenue per Visitor',
      category: MetricCategory.SALES,
      type: MetricType.CURRENCY,
      formula: 'Total Revenue / Total Visitors',
      description: 'Average revenue generated per visitor',
      unit: 'UZS',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.sales.revenuePerVisitor,
      interpretation: {
        good: { min: 25000, max: Infinity, description: 'High visitor value' },
        warning: { min: 10000, max: 24999, description: 'Moderate visitor value' },
        critical: { min: 0, max: 9999, description: 'Low visitor value' },
      },
    });

    // 2. Product Metrics (11 formulas)
    this.addMetric({
      id: 'cogs',
      name: 'Cost of Goods Sold (COGS)',
      category: MetricCategory.PRODUCT,
      type: MetricType.CURRENCY,
      formula: 'Beginning Inventory + Purchases - Ending Inventory',
      description: 'Total cost of producing goods sold',
      unit: 'UZS',
      dataSources: [DataSource.INVENTORY, DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.products.costOfGoodsSold,
      interpretation: {
        good: { min: 0, max: 50000000, description: 'Low COGS - good margins' },
        warning: { min: 50000001, max: 100000000, description: 'Moderate COGS' },
        critical: { min: 100000001, max: Infinity, description: 'High COGS - review pricing' },
      },
    });

    this.addMetric({
      id: 'unit_cost',
      name: 'Unit Cost',
      category: MetricCategory.PRODUCT,
      type: MetricType.CURRENCY,
      formula: 'Total COGS / Total Units Produced',
      description: 'Cost to produce one unit',
      unit: 'UZS',
      dataSources: [DataSource.INVENTORY, DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.products.unitCost,
      interpretation: {
        good: { min: 0, max: 5000, description: 'Low unit cost' },
        warning: { min: 5001, max: 10000, description: 'Moderate unit cost' },
        critical: { min: 10001, max: Infinity, description: 'High unit cost' },
      },
    });

    this.addMetric({
      id: 'unit_profit',
      name: 'Unit Profit',
      category: MetricCategory.PRODUCT,
      type: MetricType.CURRENCY,
      formula: 'Unit Price - Unit Cost',
      description: 'Profit earned per unit sold',
      unit: 'UZS',
      dataSources: [DataSource.INVENTORY, DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.products.unitProfit,
      interpretation: {
        good: { min: 5000, max: Infinity, description: 'High unit profit' },
        warning: { min: 1000, max: 4999, description: 'Moderate unit profit' },
        critical: { min: 0, max: 999, description: 'Low or negative unit profit' },
      },
    });

    this.addMetric({
      id: 'gross_profit',
      name: 'Gross Profit',
      category: MetricCategory.PRODUCT,
      type: MetricType.CURRENCY,
      formula: 'Revenue - COGS',
      description: 'Profit after accounting for cost of goods',
      unit: 'UZS',
      dataSources: [DataSource.SALES, DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.products.grossProfit,
      interpretation: {
        good: { min: 50000000, max: Infinity, description: 'Strong gross profit' },
        warning: { min: 20000000, max: 49999999, description: 'Moderate gross profit' },
        critical: { min: 0, max: 19999999, description: 'Low gross profit' },
      },
    });

    this.addMetric({
      id: 'gross_margin',
      name: 'Gross Margin',
      category: MetricCategory.PRODUCT,
      type: MetricType.PERCENTAGE,
      formula: '(Gross Profit / Revenue) × 100',
      description: 'Percentage of revenue retained after COGS',
      unit: '%',
      dataSources: [DataSource.SALES, DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.products.grossMargin,
      interpretation: {
        good: { min: 50, max: Infinity, description: 'Excellent gross margin' },
        warning: { min: 20, max: 49.9, description: 'Moderate gross margin' },
        critical: { min: 0, max: 19.9, description: 'Low gross margin' },
      },
    });

    this.addMetric({
      id: 'contribution_margin',
      name: 'Contribution Margin',
      category: MetricCategory.PRODUCT,
      type: MetricType.PERCENTAGE,
      formula: '(Sales - Variable Costs) / Sales × 100',
      description: 'Margin after variable costs',
      unit: '%',
      dataSources: [DataSource.SALES, DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.products.contributionMargin,
      interpretation: {
        good: { min: 40, max: Infinity, description: 'Strong contribution margin' },
        warning: { min: 20, max: 39.9, description: 'Moderate contribution margin' },
        critical: { min: 0, max: 19.9, description: 'Low contribution margin' },
      },
    });

    this.addMetric({
      id: 'sell_through_rate',
      name: 'Sell-through Rate',
      category: MetricCategory.PRODUCT,
      type: MetricType.PERCENTAGE,
      formula: '(Units Sold / Units Received) × 100',
      description: 'Percentage of inventory sold',
      unit: '%',
      dataSources: [DataSource.INVENTORY, DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.products.sellThroughRate,
      interpretation: {
        good: { min: 80, max: Infinity, description: 'Excellent sell-through' },
        warning: { min: 50, max: 79.9, description: 'Moderate sell-through' },
        critical: { min: 0, max: 49.9, description: 'Low sell-through' },
      },
    });

    this.addMetric({
      id: 'inventory_turnover',
      name: 'Inventory Turnover',
      category: MetricCategory.PRODUCT,
      type: MetricType.RATIO,
      formula: 'COGS / Average Inventory',
      description: 'Number of times inventory is sold and replaced',
      unit: 'times',
      dataSources: [DataSource.INVENTORY, DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.products.inventoryTurnover,
      interpretation: {
        good: { min: 8, max: Infinity, description: 'High inventory turnover' },
        warning: { min: 4, max: 7.9, description: 'Moderate inventory turnover' },
        critical: { min: 0, max: 3.9, description: 'Low inventory turnover' },
      },
    });

    this.addMetric({
      id: 'stock_days',
      name: 'Stock Days',
      category: MetricCategory.PRODUCT,
      type: MetricType.DAYS,
      formula: '365 / Inventory Turnover',
      description: 'Average days inventory is held',
      unit: 'days',
      dataSources: [DataSource.INVENTORY],
      calculationMethod: (data: BusinessData) => data.products.stockDays,
      interpretation: {
        good: { min: 0, max: 45, description: 'Low stock days - efficient' },
        warning: { min: 46, max: 90, description: 'Moderate stock days' },
        critical: { min: 91, max: Infinity, description: 'High stock days - excess inventory' },
      },
    });

    this.addMetric({
      id: 'stockout_rate',
      name: 'Stockout Rate',
      category: MetricCategory.PRODUCT,
      type: MetricType.PERCENTAGE,
      formula: '(Number of Stockouts / Total Demand) × 100',
      description: 'Percentage of time items are out of stock',
      unit: '%',
      dataSources: [DataSource.INVENTORY, DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.products.stockoutRate,
      interpretation: {
        good: { min: 0, max: 2, description: 'Low stockout rate' },
        warning: { min: 2.1, max: 5, description: 'Moderate stockout rate' },
        critical: { min: 5.1, max: Infinity, description: 'High stockout rate' },
      },
    });

    // 3. Profitability Metrics (11 formulas)
    this.addMetric({
      id: 'net_profit',
      name: 'Net Profit',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.CURRENCY,
      formula: 'Revenue - Total Expenses',
      description: 'Profit after all expenses',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.netProfit,
      interpretation: {
        good: { min: 50000000, max: Infinity, description: 'Strong net profit' },
        warning: { min: 10000000, max: 49999999, description: 'Moderate net profit' },
        critical: { min: -Infinity, max: 9999999, description: 'Low or negative net profit' },
      },
    });

    this.addMetric({
      id: 'net_profit_margin',
      name: 'Net Profit Margin',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.PERCENTAGE,
      formula: '(Net Profit / Revenue) × 100',
      description: 'Percentage of revenue retained as profit',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.netProfitMargin,
      interpretation: {
        good: { min: 15, max: Infinity, description: 'Excellent profit margin' },
        warning: { min: 5, max: 14.9, description: 'Moderate profit margin' },
        critical: { min: -Infinity, max: 4.9, description: 'Low or negative profit margin' },
      },
    });

    this.addMetric({
      id: 'operating_profit',
      name: 'Operating Profit',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.CURRENCY,
      formula: 'Gross Profit - Operating Expenses',
      description: 'Profit from core business operations',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.operatingProfit,
      interpretation: {
        good: { min: 75000000, max: Infinity, description: 'Strong operating profit' },
        warning: { min: 25000000, max: 74999999, description: 'Moderate operating profit' },
        critical: { min: -Infinity, max: 24999999, description: 'Low operating profit' },
      },
    });

    this.addMetric({
      id: 'operating_margin',
      name: 'Operating Margin',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.PERCENTAGE,
      formula: '(Operating Profit / Revenue) × 100',
      description: 'Operating efficiency as percentage of revenue',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.operatingMargin,
      interpretation: {
        good: { min: 20, max: Infinity, description: 'Excellent operating margin' },
        warning: { min: 10, max: 19.9, description: 'Moderate operating margin' },
        critical: { min: -Infinity, max: 9.9, description: 'Low operating margin' },
      },
    });

    this.addMetric({
      id: 'ebitda',
      name: 'EBITDA',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.CURRENCY,
      formula: 'Operating Profit + Interest + Taxes + Depreciation + Amortization',
      description: 'Earnings before interest, taxes, depreciation, and amortization',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.ebitda,
      interpretation: {
        good: { min: 100000000, max: Infinity, description: 'Strong EBITDA' },
        warning: { min: 50000000, max: 99999999, description: 'Moderate EBITDA' },
        critical: { min: -Infinity, max: 49999999, description: 'Low EBITDA' },
      },
    });

    this.addMetric({
      id: 'roi',
      name: 'Return on Investment (ROI)',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.PERCENTAGE,
      formula: '(Net Profit / Investment Cost) × 100',
      description: 'Return on investment percentage',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.roi,
      interpretation: {
        good: { min: 25, max: Infinity, description: 'Excellent ROI' },
        warning: { min: 10, max: 24.9, description: 'Moderate ROI' },
        critical: { min: -Infinity, max: 9.9, description: 'Low or negative ROI' },
      },
    });

    this.addMetric({
      id: 'roa',
      name: 'Return on Assets (ROA)',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.PERCENTAGE,
      formula: '(Net Profit / Total Assets) × 100',
      description: 'Return generated by assets',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.roa,
      interpretation: {
        good: { min: 15, max: Infinity, description: 'Excellent ROA' },
        warning: { min: 5, max: 14.9, description: 'Moderate ROA' },
        critical: { min: -Infinity, max: 4.9, description: 'Low or negative ROA' },
      },
    });

    this.addMetric({
      id: 'roe',
      name: 'Return on Equity (ROE)',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.PERCENTAGE,
      formula: '(Net Profit / Shareholder Equity) × 100',
      description: 'Return generated for shareholders',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.roe,
      interpretation: {
        good: { min: 20, max: Infinity, description: 'Excellent ROE' },
        warning: { min: 10, max: 19.9, description: 'Moderate ROE' },
        critical: { min: -Infinity, max: 9.9, description: 'Low or negative ROE' },
      },
    });

    this.addMetric({
      id: 'break_even_point',
      name: 'Break-even Point',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.CURRENCY,
      formula: 'Fixed Costs / (Price - Variable Cost per Unit)',
      description: 'Revenue level where profit equals zero',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.breakEvenPoint,
      interpretation: {
        good: { min: 0, max: 50000000, description: 'Low break-even point' },
        warning: { min: 50000001, max: 100000000, description: 'Moderate break-even point' },
        critical: { min: 100000001, max: Infinity, description: 'High break-even point' },
      },
    });

    this.addMetric({
      id: 'contribution_per_unit',
      name: 'Contribution per Unit',
      category: MetricCategory.PROFITABILITY,
      type: MetricType.CURRENCY,
      formula: 'Price - Variable Cost per Unit',
      description: 'Contribution margin per unit sold',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.profitability.contributionPerUnit,
      interpretation: {
        good: { min: 5000, max: Infinity, description: 'High contribution per unit' },
        warning: { min: 2000, max: 4999, description: 'Moderate contribution per unit' },
        critical: { min: 0, max: 1999, description: 'Low contribution per unit' },
      },
    });

    // 4. Marketing & Customer Metrics (11 formulas)
    this.addMetric({
      id: 'cac',
      name: 'Customer Acquisition Cost (CAC)',
      category: MetricCategory.MARKETING,
      type: MetricType.CURRENCY,
      formula: 'Total Marketing Spend / New Customers Acquired',
      description: 'Cost to acquire a new customer',
      unit: 'UZS',
      dataSources: [DataSource.MARKETING, DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.customerAcquisitionCost,
      interpretation: {
        good: { min: 0, max: 50000, description: 'Low acquisition cost' },
        warning: { min: 50001, max: 100000, description: 'Moderate acquisition cost' },
        critical: { min: 100001, max: Infinity, description: 'High acquisition cost' },
      },
    });

    this.addMetric({
      id: 'ltv',
      name: 'Customer Lifetime Value (LTV)',
      category: MetricCategory.MARKETING,
      type: MetricType.CURRENCY,
      formula: 'Average Order Value × Purchase Frequency × Customer Lifetime',
      description: 'Total value a customer brings over their lifetime',
      unit: 'UZS',
      dataSources: [DataSource.MARKETING, DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.customerLifetimeValue,
      interpretation: {
        good: { min: 500000, max: Infinity, description: 'High customer lifetime value' },
        warning: { min: 200000, max: 499999, description: 'Moderate customer lifetime value' },
        critical: { min: 0, max: 199999, description: 'Low customer lifetime value' },
      },
    });

    this.addMetric({
      id: 'ltv_cac_ratio',
      name: 'LTV/CAC Ratio',
      category: MetricCategory.MARKETING,
      type: MetricType.RATIO,
      formula: 'Customer Lifetime Value / Customer Acquisition Cost',
      description: 'Ratio of lifetime value to acquisition cost',
      unit: 'ratio',
      dataSources: [DataSource.MARKETING, DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.ltvToCacRatio,
      interpretation: {
        good: { min: 3, max: Infinity, description: 'Excellent LTV/CAC ratio' },
        warning: { min: 1, max: 2.9, description: 'Moderate LTV/CAC ratio' },
        critical: { min: 0, max: 0.9, description: 'Poor LTV/CAC ratio' },
      },
    });

    this.addMetric({
      id: 'customer_retention_rate',
      name: 'Customer Retention Rate',
      category: MetricCategory.MARKETING,
      type: MetricType.PERCENTAGE,
      formula: '((Customers at End - New Customers) / Customers at Start) × 100',
      description: 'Percentage of customers retained over time',
      unit: '%',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.customerRetentionRate,
      interpretation: {
        good: { min: 80, max: Infinity, description: 'Excellent customer retention' },
        warning: { min: 60, max: 79.9, description: 'Moderate customer retention' },
        critical: { min: 0, max: 59.9, description: 'Low customer retention' },
      },
    });

    this.addMetric({
      id: 'churn_rate',
      name: 'Churn Rate',
      category: MetricCategory.MARKETING,
      type: MetricType.PERCENTAGE,
      formula: '(Customers Lost / Total Customers) × 100',
      description: 'Percentage of customers lost over time',
      unit: '%',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.churnRate,
      interpretation: {
        good: { min: 0, max: 5, description: 'Low churn rate' },
        warning: { min: 5.1, max: 15, description: 'Moderate churn rate' },
        critical: { min: 15.1, max: Infinity, description: 'High churn rate' },
      },
    });

    this.addMetric({
      id: 'csat',
      name: 'Customer Satisfaction Score (CSAT)',
      category: MetricCategory.MARKETING,
      type: MetricType.SCORE,
      formula: '(Sum of Satisfaction Scores / Number of Responses) × 100',
      description: 'Customer satisfaction measurement',
      unit: 'score',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.customerSatisfactionScore,
      interpretation: {
        good: { min: 80, max: 100, description: 'Excellent customer satisfaction' },
        warning: { min: 60, max: 79.9, description: 'Moderate customer satisfaction' },
        critical: { min: 0, max: 59.9, description: 'Low customer satisfaction' },
      },
    });

    this.addMetric({
      id: 'nps',
      name: 'Net Promoter Score (NPS)',
      category: MetricCategory.MARKETING,
      type: MetricType.SCORE,
      formula: '% Promoters - % Detractors',
      description: 'Customer loyalty measurement',
      unit: 'score',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.marketing.netPromoterScore,
      interpretation: {
        good: { min: 50, max: 100, description: 'Excellent NPS' },
        warning: { min: 0, max: 49, description: 'Moderate NPS' },
        critical: { min: -100, max: -1, description: 'Poor NPS' },
      },
    });

    this.addMetric({
      id: 'cost_per_lead',
      name: 'Cost per Lead',
      category: MetricCategory.MARKETING,
      type: MetricType.CURRENCY,
      formula: 'Total Marketing Spend / Number of Leads',
      description: 'Cost to generate a lead',
      unit: 'UZS',
      dataSources: [DataSource.MARKETING],
      calculationMethod: (data: BusinessData) => data.marketing.costPerLead,
      interpretation: {
        good: { min: 0, max: 10000, description: 'Low cost per lead' },
        warning: { min: 10001, max: 25000, description: 'Moderate cost per lead' },
        critical: { min: 25001, max: Infinity, description: 'High cost per lead' },
      },
    });

    this.addMetric({
      id: 'lead_conversion_rate',
      name: 'Lead Conversion Rate',
      category: MetricCategory.MARKETING,
      type: MetricType.PERCENTAGE,
      formula: '(Customers / Leads) × 100',
      description: 'Percentage of leads that become customers',
      unit: '%',
      dataSources: [DataSource.MARKETING],
      calculationMethod: (data: BusinessData) => data.marketing.leadConversionRate,
      interpretation: {
        good: { min: 10, max: Infinity, description: 'Excellent lead conversion' },
        warning: { min: 5, max: 9.9, description: 'Moderate lead conversion' },
        critical: { min: 0, max: 4.9, description: 'Low lead conversion' },
      },
    });

    this.addMetric({
      id: 'marketing_roi',
      name: 'Marketing ROI',
      category: MetricCategory.MARKETING,
      type: MetricType.PERCENTAGE,
      formula: '(Revenue from Marketing - Marketing Cost) / Marketing Cost × 100',
      description: 'Return on marketing investment',
      unit: '%',
      dataSources: [DataSource.MARKETING, DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.marketing.marketingRoi,
      interpretation: {
        good: { min: 300, max: Infinity, description: 'Excellent marketing ROI' },
        warning: { min: 100, max: 299, description: 'Moderate marketing ROI' },
        critical: { min: -Infinity, max: 99, description: 'Poor marketing ROI' },
      },
    });

    // 5. Debt & Credit Metrics (10 formulas)
    this.addMetric({
      id: 'debt_ratio',
      name: 'Debt Ratio',
      category: MetricCategory.DEBT,
      type: MetricType.PERCENTAGE,
      formula: 'Total Debt / Total Assets × 100',
      description: 'Proportion of assets financed by debt',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.debtRatio,
      interpretation: {
        good: { min: 0, max: 30, description: 'Low debt ratio' },
        warning: { min: 30.1, max: 60, description: 'Moderate debt ratio' },
        critical: { min: 60.1, max: Infinity, description: 'High debt ratio' },
      },
    });

    this.addMetric({
      id: 'debt_to_equity_ratio',
      name: 'Debt-to-Equity Ratio',
      category: MetricCategory.DEBT,
      type: MetricType.RATIO,
      formula: 'Total Debt / Total Equity',
      description: 'Ratio of debt to equity',
      unit: 'ratio',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.debtToEquityRatio,
      interpretation: {
        good: { min: 0, max: 0.5, description: 'Low debt-to-equity ratio' },
        warning: { min: 0.51, max: 1.5, description: 'Moderate debt-to-equity ratio' },
        critical: { min: 1.51, max: Infinity, description: 'High debt-to-equity ratio' },
      },
    });

    this.addMetric({
      id: 'interest_coverage_ratio',
      name: 'Interest Coverage Ratio',
      category: MetricCategory.DEBT,
      type: MetricType.RATIO,
      formula: 'EBIT / Interest Expense',
      description: 'Ability to pay interest expenses',
      unit: 'ratio',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.interestCoverageRatio,
      interpretation: {
        good: { min: 3, max: Infinity, description: 'Strong interest coverage' },
        warning: { min: 1.5, max: 2.9, description: 'Moderate interest coverage' },
        critical: { min: 0, max: 1.4, description: 'Poor interest coverage' },
      },
    });

    this.addMetric({
      id: 'default_rate',
      name: 'Default Rate',
      category: MetricCategory.DEBT,
      type: MetricType.PERCENTAGE,
      formula: '(Defaults / Total Loans) × 100',
      description: 'Percentage of loans that default',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.defaultRate,
      interpretation: {
        good: { min: 0, max: 2, description: 'Low default rate' },
        warning: { min: 2.1, max: 5, description: 'Moderate default rate' },
        critical: { min: 5.1, max: Infinity, description: 'High default rate' },
      },
    });

    this.addMetric({
      id: 'accounts_receivable',
      name: 'Accounts Receivable',
      category: MetricCategory.DEBT,
      type: MetricType.CURRENCY,
      formula: 'Total Amount Owed by Customers',
      description: 'Total money owed by customers',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.accountsReceivable,
      interpretation: {
        good: { min: 0, max: 50000000, description: 'Low accounts receivable' },
        warning: { min: 50000001, max: 100000000, description: 'Moderate accounts receivable' },
        critical: { min: 100000001, max: Infinity, description: 'High accounts receivable' },
      },
    });

    this.addMetric({
      id: 'receivable_turnover',
      name: 'Receivable Turnover',
      category: MetricCategory.DEBT,
      type: MetricType.RATIO,
      formula: 'Net Credit Sales / Average Accounts Receivable',
      description: 'How quickly receivables are collected',
      unit: 'times',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.receivableTurnover,
      interpretation: {
        good: { min: 8, max: Infinity, description: 'High receivable turnover' },
        warning: { min: 4, max: 7.9, description: 'Moderate receivable turnover' },
        critical: { min: 0, max: 3.9, description: 'Low receivable turnover' },
      },
    });

    this.addMetric({
      id: 'dso',
      name: 'Days Sales Outstanding (DSO)',
      category: MetricCategory.DEBT,
      type: MetricType.DAYS,
      formula: '365 / Receivable Turnover',
      description: 'Average days to collect receivables',
      unit: 'days',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.daysSalesOutstanding,
      interpretation: {
        good: { min: 0, max: 30, description: 'Fast collection' },
        warning: { min: 31, max: 60, description: 'Moderate collection' },
        critical: { min: 61, max: Infinity, description: 'Slow collection' },
      },
    });

    this.addMetric({
      id: 'bad_debt_ratio',
      name: 'Bad Debt Ratio',
      category: MetricCategory.DEBT,
      type: MetricType.PERCENTAGE,
      formula: '(Bad Debts / Total Credit Sales) × 100',
      description: 'Percentage of credit sales that become bad debts',
      unit: '%',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.debt.badDebtRatio,
      interpretation: {
        good: { min: 0, max: 1, description: 'Low bad debt ratio' },
        warning: { min: 1.1, max: 3, description: 'Moderate bad debt ratio' },
        critical: { min: 3.1, max: Infinity, description: 'High bad debt ratio' },
      },
    });

    // 6. Cash Flow Metrics (5 formulas)
    this.addMetric({
      id: 'operating_cash_flow',
      name: 'Operating Cash Flow',
      category: MetricCategory.CASH_FLOW,
      type: MetricType.CURRENCY,
      formula: 'Cash from Operations',
      description: 'Cash generated from core operations',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.cashFlow.operatingCashFlow,
      interpretation: {
        good: { min: 50000000, max: Infinity, description: 'Strong operating cash flow' },
        warning: { min: 10000000, max: 49999999, description: 'Moderate operating cash flow' },
        critical: { min: -Infinity, max: 9999999, description: 'Low or negative cash flow' },
      },
    });

    this.addMetric({
      id: 'free_cash_flow',
      name: 'Free Cash Flow',
      category: MetricCategory.CASH_FLOW,
      type: MetricType.CURRENCY,
      formula: 'Operating Cash Flow - Capital Expenditures',
      description: 'Cash available after maintaining assets',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.cashFlow.freeCashFlow,
      interpretation: {
        good: { min: 25000000, max: Infinity, description: 'Strong free cash flow' },
        warning: { min: 5000000, max: 24999999, description: 'Moderate free cash flow' },
        critical: { min: -Infinity, max: 4999999, description: 'Low or negative free cash flow' },
      },
    });

    this.addMetric({
      id: 'cash_burn_rate',
      name: 'Cash Burn Rate',
      category: MetricCategory.CASH_FLOW,
      type: MetricType.CURRENCY,
      formula: 'Monthly Cash Expenses - Monthly Revenue',
      description: 'Rate at which cash is being spent',
      unit: 'UZS/month',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.cashFlow.cashBurnRate,
      interpretation: {
        good: { min: -Infinity, max: 0, description: 'No cash burn' },
        warning: { min: 1, max: 5000000, description: 'Moderate cash burn' },
        critical: { min: 5000001, max: Infinity, description: 'High cash burn' },
      },
    });

    this.addMetric({
      id: 'cash_runway',
      name: 'Cash Runway',
      category: MetricCategory.CASH_FLOW,
      type: MetricType.DAYS,
      formula: 'Current Cash / Monthly Cash Burn',
      description: 'Number of months until cash runs out',
      unit: 'days',
      dataSources: [DataSource.FINANCIAL],
      calculationMethod: (data: BusinessData) => data.cashFlow.cashRunway,
      interpretation: {
        good: { min: 180, max: Infinity, description: 'Long cash runway' },
        warning: { min: 90, max: 179, description: 'Moderate cash runway' },
        critical: { min: 0, max: 89, description: 'Short cash runway' },
      },
    });

    this.addMetric({
      id: 'cash_conversion_cycle',
      name: 'Cash Conversion Cycle',
      category: MetricCategory.CASH_FLOW,
      type: MetricType.DAYS,
      formula: 'Days Inventory + Days Sales Outstanding - Days Payable Outstanding',
      description: 'Time to convert inventory to cash',
      unit: 'days',
      dataSources: [DataSource.FINANCIAL, DataSource.INVENTORY],
      calculationMethod: (data: BusinessData) => data.cashFlow.cashConversionCycle,
      interpretation: {
        good: { min: 0, max: 30, description: 'Fast cash conversion' },
        warning: { min: 31, max: 60, description: 'Moderate cash conversion' },
        critical: { min: 61, max: Infinity, description: 'Slow cash conversion' },
      },
    });

    // 7. Operational Efficiency Metrics (8 formulas)
    this.addMetric({
      id: 'employee_productivity',
      name: 'Employee Productivity',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.RATIO,
      formula: 'Output / Number of Employees',
      description: 'Output generated per employee',
      unit: 'units/employee',
      dataSources: [DataSource.HR, DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.operational.employeeProductivity,
      interpretation: {
        good: { min: 100, max: Infinity, description: 'High employee productivity' },
        warning: { min: 50, max: 99, description: 'Moderate employee productivity' },
        critical: { min: 0, max: 49, description: 'Low employee productivity' },
      },
    });

    this.addMetric({
      id: 'revenue_per_employee',
      name: 'Revenue per Employee',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.CURRENCY,
      formula: 'Total Revenue / Total Employees',
      description: 'Revenue generated per employee',
      unit: 'UZS',
      dataSources: [DataSource.SALES, DataSource.HR],
      calculationMethod: (data: BusinessData) => data.operational.revenuePerEmployee,
      interpretation: {
        good: { min: 10000000, max: Infinity, description: 'High revenue per employee' },
        warning: { min: 5000000, max: 9999999, description: 'Moderate revenue per employee' },
        critical: { min: 0, max: 4999999, description: 'Low revenue per employee' },
      },
    });

    this.addMetric({
      id: 'cost_per_employee',
      name: 'Cost per Employee',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.CURRENCY,
      formula: 'Total Costs / Total Employees',
      description: 'Cost incurred per employee',
      unit: 'UZS',
      dataSources: [DataSource.FINANCIAL, DataSource.HR],
      calculationMethod: (data: BusinessData) => data.operational.costPerEmployee,
      interpretation: {
        good: { min: 0, max: 3000000, description: 'Low cost per employee' },
        warning: { min: 3000001, max: 6000000, description: 'Moderate cost per employee' },
        critical: { min: 6000001, max: Infinity, description: 'High cost per employee' },
      },
    });

    this.addMetric({
      id: 'order_fulfillment_time',
      name: 'Order Fulfillment Time',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.TIME,
      formula: 'Time from Order to Delivery',
      description: 'Average time to fulfill orders',
      unit: 'hours',
      dataSources: [DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.operational.orderFulfillmentTime,
      interpretation: {
        good: { min: 0, max: 24, description: 'Fast fulfillment' },
        warning: { min: 25, max: 48, description: 'Moderate fulfillment' },
        critical: { min: 49, max: Infinity, description: 'Slow fulfillment' },
      },
    });

    this.addMetric({
      id: 'return_rate',
      name: 'Return Rate',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.PERCENTAGE,
      formula: '(Returns / Total Orders) × 100',
      description: 'Percentage of orders returned',
      unit: '%',
      dataSources: [DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.operational.returnRate,
      interpretation: {
        good: { min: 0, max: 2, description: 'Low return rate' },
        warning: { min: 2.1, max: 5, description: 'Moderate return rate' },
        critical: { min: 5.1, max: Infinity, description: 'High return rate' },
      },
    });

    this.addMetric({
      id: 'defect_rate',
      name: 'Defect Rate',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.PERCENTAGE,
      formula: '(Defective Products / Total Products) × 100',
      description: 'Percentage of defective products',
      unit: '%',
      dataSources: [DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.operational.defectRate,
      interpretation: {
        good: { min: 0, max: 1, description: 'Low defect rate' },
        warning: { min: 1.1, max: 3, description: 'Moderate defect rate' },
        critical: { min: 3.1, max: Infinity, description: 'High defect rate' },
      },
    });

    this.addMetric({
      id: 'on_time_delivery_rate',
      name: 'On-time Delivery Rate',
      category: MetricCategory.OPERATIONAL,
      type: MetricType.PERCENTAGE,
      formula: '(On-time Deliveries / Total Deliveries) × 100',
      description: 'Percentage of deliveries on time',
      unit: '%',
      dataSources: [DataSource.OPERATIONS],
      calculationMethod: (data: BusinessData) => data.operational.onTimeDeliveryRate,
      interpretation: {
        good: { min: 95, max: 100, description: 'Excellent on-time delivery' },
        warning: { min: 85, max: 94.9, description: 'Good on-time delivery' },
        critical: { min: 0, max: 84.9, description: 'Poor on-time delivery' },
      },
    });

    // 8. Strategic Growth Metrics (5 formulas)
    this.addMetric({
      id: 'market_share',
      name: 'Market Share',
      category: MetricCategory.STRATEGIC,
      type: MetricType.PERCENTAGE,
      formula: '(Company Revenue / Total Market Size) × 100',
      description: 'Percentage of total market captured',
      unit: '%',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.strategic.marketShare,
      interpretation: {
        good: { min: 20, max: Infinity, description: 'Strong market position' },
        warning: { min: 5, max: 19.9, description: 'Moderate market position' },
        critical: { min: 0, max: 4.9, description: 'Weak market position' },
      },
    });

    this.addMetric({
      id: 'customer_growth_rate',
      name: 'Customer Growth Rate',
      category: MetricCategory.STRATEGIC,
      type: MetricType.PERCENTAGE,
      formula: '((Current Customers - Previous Customers) / Previous Customers) × 100',
      description: 'Rate of customer base growth',
      unit: '%',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.strategic.customerGrowthRate,
      interpretation: {
        good: { min: 20, max: Infinity, description: 'Excellent customer growth' },
        warning: { min: 10, max: 19.9, description: 'Moderate customer growth' },
        critical: { min: -Infinity, max: 9.9, description: 'Low or negative growth' },
      },
    });

    this.addMetric({
      id: 'product_growth_rate',
      name: 'Product Growth Rate',
      category: MetricCategory.STRATEGIC,
      type: MetricType.PERCENTAGE,
      formula: '((Current Product Sales - Previous Product Sales) / Previous Product Sales) × 100',
      description: 'Rate of product sales growth',
      unit: '%',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.strategic.productGrowthRate,
      interpretation: {
        good: { min: 15, max: Infinity, description: 'Excellent product growth' },
        warning: { min: 5, max: 14.9, description: 'Moderate product growth' },
        critical: { min: -Infinity, max: 4.9, description: 'Low or negative growth' },
      },
    });

    this.addMetric({
      id: 'expansion_revenue',
      name: 'Expansion Revenue',
      category: MetricCategory.STRATEGIC,
      type: MetricType.CURRENCY,
      formula: 'Revenue from New Markets or Products',
      description: 'Revenue from expansion activities',
      unit: 'UZS',
      dataSources: [DataSource.SALES],
      calculationMethod: (data: BusinessData) => data.strategic.expansionRevenue,
      interpretation: {
        good: { min: 50000000, max: Infinity, description: 'Strong expansion revenue' },
        warning: { min: 10000000, max: 49999999, description: 'Moderate expansion revenue' },
        critical: { min: 0, max: 9999999, description: 'Low expansion revenue' },
      },
    });

    this.addMetric({
      id: 'new_vs_returning_customers',
      name: 'New vs Returning Customers',
      category: MetricCategory.STRATEGIC,
      type: MetricType.RATIO,
      formula: 'New Customers / Returning Customers',
      description: 'Ratio of new to returning customers',
      unit: 'ratio',
      dataSources: [DataSource.CUSTOMERS],
      calculationMethod: (data: BusinessData) => data.strategic.newVsReturningCustomers.new / data.strategic.newVsReturningCustomers.returning,
      interpretation: {
        good: { min: 0.5, max: 1.5, description: 'Balanced customer acquisition' },
        warning: { min: 0.2, max: 0.4, description: 'Low new customer acquisition' },
        critical: { min: 0, max: 0.1, description: 'Very low new customer acquisition' },
      },
    });
  }

  // Add metric to collection
  private addMetric(metric: Metric): void {
    this.metrics.set(metric.id, metric);
  }

  // Get all metrics
  getMetrics(category?: MetricCategory): Metric[] {
    const metrics = Array.from(this.metrics.values());
    return category ? metrics.filter(m => m.category === category) : metrics;
  }

  // Get metric by ID
  getMetric(id: string): Metric | undefined {
    return this.metrics.get(id);
  }

  // Calculate metric value
  calculateMetric(metricId: string, data: BusinessData): AnalyticsResult {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error('Metric not found');
    }

    const value = metric.calculationMethod(data);
    
    // Determine trend (simplified - would need historical data in real implementation)
    const trend: 'up' | 'down' | 'stable' = 'stable';
    const changePercentage = 0;

    // Generate insights and recommendations based on value
    const insights = this.generateInsights(metric, value);
    const recommendations = this.generateRecommendations(metric, value);

    // Determine data quality and confidence
    const dataQuality = this.assessDataQuality(data, metric);
    const confidence = this.calculateConfidence(dataQuality);

    return {
      metric,
      value,
      period: TimePeriod.MONTHLY,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      trend,
      changePercentage,
      comparison: {
        previousPeriod: value * 0.95, // Simplified
        target: metric.target || 0,
        benchmark: metric.benchmark || 0,
      },
      insights,
      recommendations,
      dataQuality,
      confidence,
    };
  }

  // Calculate all metrics
  calculateAllMetrics(data: BusinessData): AnalyticsResult[] {
    const results: AnalyticsResult[] = [];
    
    for (const metric of this.metrics.values()) {
      try {
        const result = this.calculateMetric(metric.id, data);
        results.push(result);
      } catch (error) {
        console.error(`Failed to calculate metric ${metric.id}:`, error);
      }
    }
    
    return results;
  }

  // Generate insights based on metric value
  private generateInsights(metric: Metric, value: number): string[] {
    const insights: string[] = [];
    
    if (value >= metric.interpretation.good.min && value <= metric.interpretation.good.max) {
      insights.push(`Excellent ${metric.name} performance`);
      insights.push(metric.interpretation.good.description);
    } else if (value >= metric.interpretation.warning.min && value <= metric.interpretation.warning.max) {
      insights.push(`${metric.name} needs attention`);
      insights.push(metric.interpretation.warning.description);
    } else {
      insights.push(`Critical ${metric.name} performance`);
      insights.push(metric.interpretation.critical.description);
    }
    
    return insights;
  }

  // Generate recommendations based on metric value
  private generateRecommendations(metric: Metric, value: number): string[] {
    const recommendations: string[] = [];
    
    if (value < metric.interpretation.warning.min) {
      recommendations.push(`Immediate action required for ${metric.name}`);
      recommendations.push('Review current processes and implement improvements');
    } else if (value < metric.interpretation.good.min) {
      recommendations.push(`Monitor ${metric.name} closely`);
      recommendations.push('Consider optimization strategies');
    } else {
      recommendations.push(`Maintain current ${metric.name} performance`);
      recommendations.push('Look for opportunities to further improve');
    }
    
    return recommendations;
  }

  // Assess data quality
  private assessDataQuality(data: BusinessData, metric: Metric): 'excellent' | 'good' | 'fair' | 'poor' {
    // Simplified assessment - would check data completeness, accuracy, timeliness
    let qualityScore = 100;
    
    // Check if required data sources are available
    for (const dataSource of metric.dataSources) {
      switch (dataSource) {
        case DataSource.SALES:
          if (!data.sales) qualityScore -= 25;
          break;
        case DataSource.CUSTOMERS:
          if (!data.customers) qualityScore -= 25;
          break;
        case DataSource.FINANCIAL:
          if (!data.profitability) qualityScore -= 25;
          break;
        // Add more data source checks...
      }
    }
    
    if (qualityScore >= 90) return 'excellent';
    if (qualityScore >= 70) return 'good';
    if (qualityScore >= 50) return 'fair';
    return 'poor';
  }

  // Calculate confidence based on data quality
  private calculateConfidence(dataQuality: 'excellent' | 'good' | 'fair' | 'poor'): number {
    switch (dataQuality) {
      case 'excellent': return 95;
      case 'good': return 80;
      case 'fair': return 60;
      case 'poor': return 40;
    }
  }

  // Get metrics summary by category
  getMetricsSummary(data: BusinessData): {
    category: MetricCategory;
    metricsCount: number;
    averageScore: number;
    criticalIssues: number;
    warnings: number;
    goodPerformance: number;
  }[] {
    const summary: {
      category: MetricCategory;
      metricsCount: number;
      averageScore: number;
      criticalIssues: number;
      warnings: number;
      goodPerformance: number;
    }[] = [];

    for (const category of Object.values(MetricCategory)) {
      const categoryMetrics = this.getMetrics(category);
      const results = categoryMetrics.map(metric => this.calculateMetric(metric.id, data));
      
      let criticalIssues = 0;
      let warnings = 0;
      let goodPerformance = 0;
      let totalScore = 0;
      
      for (const result of results) {
        if (result.value >= result.metric.interpretation.good.min && result.value <= result.metric.interpretation.good.max) {
          goodPerformance++;
          totalScore += 100;
        } else if (result.value >= result.metric.interpretation.warning.min && result.value <= result.metric.interpretation.warning.max) {
          warnings++;
          totalScore += 60;
        } else {
          criticalIssues++;
          totalScore += 20;
        }
      }
      
      summary.push({
        category,
        metricsCount: categoryMetrics.length,
        averageScore: results.length > 0 ? totalScore / results.length : 0,
        criticalIssues,
        warnings,
        goodPerformance,
      });
    }
    
    return summary;
  }

  // Generate comprehensive report
  generateReport(data: BusinessData): {
    overallScore: number;
    categorySummaries: any[];
    topIssues: any[];
    topPerformers: any[];
    recommendations: string[];
    generatedAt: Date;
  } {
    const allResults = this.calculateAllMetrics(data);
    const categorySummaries = this.getMetricsSummary(data);
    
    // Calculate overall score
    const overallScore = categorySummaries.reduce((sum, cat) => sum + cat.averageScore, 0) / categorySummaries.length;
    
    // Find top issues
    const topIssues = allResults
      .filter(result => result.value < result.metric.interpretation.warning.min)
      .sort((a, b) => a.value - b.value)
      .slice(0, 10);
    
    // Find top performers
    const topPerformers = allResults
      .filter(result => result.value >= result.metric.interpretation.good.min)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    // Generate overall recommendations
    const recommendations: string[] = [];
    
    if (overallScore < 60) {
      recommendations.push('Critical: Immediate action required to improve business performance');
      recommendations.push('Focus on addressing critical issues in underperforming categories');
    } else if (overallScore < 80) {
      recommendations.push('Monitor performance and implement improvement strategies');
      recommendations.push('Address warning-level issues before they become critical');
    } else {
      recommendations.push('Maintain current performance levels');
      recommendations.push('Look for optimization opportunities in strong areas');
    }
    
    return {
      overallScore,
      categorySummaries,
      topIssues,
      topPerformers,
      recommendations,
      generatedAt: new Date(),
    };
  }

  // Test analytics system
  testAnalytics(): {
    metricsCount: number;
    calculations: boolean;
    reportGeneration: boolean;
    insights: boolean;
  } {
    console.log('Testing Super Analytics system...');
    
    const results = {
      metricsCount: this.metrics.size,
      calculations: false,
      reportGeneration: false,
      insights: false,
    };
    
    try {
      // Test with sample data
      const sampleData: BusinessData = {
        sales: {
          totalRevenue: 500000000,
          totalOrders: 1000,
          totalCustomers: 500,
          totalVisitors: 5000,
          repeatCustomers: 300,
          newCustomers: 200,
          averageOrderValue: 500000,
          conversionRate: 20,
          salesGrowthRate: 15,
          salesPerCustomer: 1000000,
          salesPerDay: 16666667,
          salesPerEmployee: 25000000,
          repeatPurchaseRate: 60,
          revenuePerVisitor: 100000,
        },
        products: {
          totalProducts: 50,
          costOfGoodsSold: 300000000,
          unitCost: 3000,
          unitPrice: 5000,
          unitProfit: 2000,
          grossProfit: 200000000,
          grossMargin: 40,
          contributionMargin: 35,
          sellThroughRate: 85,
          inventoryTurnover: 6,
          stockDays: 60,
          stockoutRate: 3,
          totalInventory: 10000000,
          averageInventory: 8000000,
        },
        profitability: {
          netProfit: 100000000,
          netProfitMargin: 20,
          operatingProfit: 150000000,
          operatingMargin: 30,
          ebitda: 180000000,
          roi: 25,
          roa: 15,
          roe: 20,
          breakEvenPoint: 200000000,
          contributionPerUnit: 2000,
          totalExpenses: 400000000,
          operatingExpenses: 50000000,
        },
        marketing: {
          customerAcquisitionCost: 50000,
          customerLifetimeValue: 500000,
          ltvToCacRatio: 10,
          customerRetentionRate: 85,
          churnRate: 15,
          customerSatisfactionScore: 85,
          netPromoterScore: 45,
          costPerLead: 5000,
          leadConversionRate: 10,
          marketingRoi: 400,
          totalMarketingSpend: 10000000,
          totalLeads: 2000,
        },
        debt: {
          totalDebt: 100000000,
          totalEquity: 200000000,
          debtRatio: 33,
          debtToEquityRatio: 0.5,
          interestCoverageRatio: 5,
          defaultRate: 2,
          accountsReceivable: 50000000,
          receivableTurnover: 8,
          daysSalesOutstanding: 45,
          badDebtRatio: 1,
          interestExpense: 10000000,
          ebit: 50000000,
        },
        cashFlow: {
          operatingCashFlow: 120000000,
          freeCashFlow: 100000000,
          cashBurnRate: 0,
          cashRunway: 365,
          cashConversionCycle: 45,
          beginningCash: 200000000,
          endingCash: 300000000,
          capitalExpenditures: 20000000,
          workingCapital: 150000000,
        },
        operational: {
          employeeProductivity: 100,
          revenuePerEmployee: 25000000,
          costPerEmployee: 5000000,
          orderFulfillmentTime: 24,
          returnRate: 2,
          defectRate: 1,
          onTimeDeliveryRate: 95,
          totalEmployees: 20,
          totalOrders: 1000,
          totalReturns: 20,
          defectiveProducts: 10,
          onTimeDeliveries: 950,
        },
        strategic: {
          marketShare: 15,
          customerGrowthRate: 20,
          productGrowthRate: 18,
          expansionRevenue: 50000000,
          newVsReturningCustomers: { new: 200, returning: 300 },
          totalMarketSize: 3333333333,
          competitorRevenue: 2833333333,
          newProductRevenue: 10000000,
          existingProductRevenue: 490000000,
        },
      };
      
      // Test calculations
      const results = this.calculateAllMetrics(sampleData);
      results.calculations = results.length === this.metrics.size;
      
      // Test report generation
      const report = this.generateReport(sampleData);
      results.reportGeneration = report.overallScore > 0;
      
      // Test insights generation
      const sampleMetric = this.metrics.values().next().value;
      if (sampleMetric) {
        const result = this.calculateMetric(sampleMetric.id, sampleData);
        results.insights = result.insights.length > 0 && result.recommendations.length > 0;
      }
      
    } catch (error) {
      console.error('Analytics test failed:', error);
    }
    
    return results;
  }
}

// Create singleton instance
export const superAnalytics = ProfessionalSuperAnalyticsManager.getInstance;

// Convenience functions
export const calculateMetric = (metricId: string, data: BusinessData) => {
  const analytics = ProfessionalSuperAnalyticsManager.getInstance();
  return analytics.calculateMetric(metricId, data);
};

export const generateBusinessReport = (data: BusinessData) => {
  const analytics = ProfessionalSuperAnalyticsManager.getInstance();
  return analytics.generateReport(data);
};

export default ProfessionalSuperAnalyticsManager;
