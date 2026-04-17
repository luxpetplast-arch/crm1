// Advanced AI Analytics Functions

export interface AdvancedMetrics {
  customerLifetimeValue: number;
  customerRetentionRate: number;
  churnRate: number;
  inventoryTurnoverRatio: number;
  cashConversionCycle: number;
  operatingCashFlow: number;
  returnOnInvestment: number;
  breakEvenPoint: number;
  profitabilityIndex: number;
  marketBasketAnalysis: any[];
  seasonalityIndex: any[];
  demandElasticity: number;
  priceOptimization: any[];
  riskScore: number;
  growthPotential: number;
}

// Kengaytirilgan Metrikalar Hisoblash
export async function calculateAdvancedMetrics(
  sales: any[], 
  expenses: any[], 
  customers: any[], 
  startDate: Date, 
  days: number
): Promise<AdvancedMetrics> {
  // Customer Lifetime Value (CLV)
  const avgCustomerRevenue = sales.length > 0 && customers.length > 0
    ? sales.reduce((sum, s) => sum + s.totalAmount, 0) / customers.length 
    : 0;
  const avgCustomerLifespan = 24; // 2 yil (months)
  const customerLifetimeValue = avgCustomerRevenue * avgCustomerLifespan;

  // Customer Retention Rate
  const oldCustomers = customers.filter(c => c.createdAt < startDate).length;
  const retainedCustomers = customers.filter(c => {
    const hasSales = sales.some(s => s.customerId === c.id);
    return c.createdAt < startDate && hasSales;
  }).length;
  const customerRetentionRate = oldCustomers > 0 ? (retainedCustomers / oldCustomers) * 100 : 0;
  const churnRate = 100 - customerRetentionRate;

  // Inventory Turnover Ratio
  const totalCOGS = sales.reduce((sum, s) => sum + (s.totalAmount * 0.6), 0); // 60% COGS
  const avgInventory = 50000; // Placeholder
  const inventoryTurnoverRatio = avgInventory > 0 ? totalCOGS / avgInventory : 0;

  // Cash Conversion Cycle
  const daysInventoryOutstanding = inventoryTurnoverRatio > 0 ? 365 / inventoryTurnoverRatio : 0;
  const daysReceivablesOutstanding = 30;
  const daysPayablesOutstanding = 45;
  const cashConversionCycle = daysInventoryOutstanding + daysReceivablesOutstanding - daysPayablesOutstanding;

  // Operating Cash Flow
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const operatingCashFlow = totalRevenue - totalExpenses;

  // ROI
  const totalInvestment = totalExpenses;
  const returnOnInvestment = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

  // Break-Even Point
  const fixedCosts = totalExpenses * 0.4;
  const variableCostPerUnit = sales.length > 0 ? (totalExpenses * 0.6) / sales.length : 0;
  const avgPricePerUnit = sales.length > 0 ? totalRevenue / sales.length : 0;
  const breakEvenPoint = avgPricePerUnit > variableCostPerUnit 
    ? fixedCosts / (avgPricePerUnit - variableCostPerUnit) 
    : 0;

  // Profitability Index
  const netProfit = totalRevenue - totalExpenses;
  const profitabilityIndex = totalInvestment > 0 ? netProfit / totalInvestment : 0;

  // Market Basket Analysis
  const marketBasketAnalysis = analyzeMarketBasket(sales);

  // Seasonality Index
  const seasonalityIndex = calculateSeasonality(sales, days);

  // Demand Elasticity
  const demandElasticity = calculateDemandElasticity(sales);

  // Price Optimization
  const priceOptimization = optimizePricing(sales);

  // Risk Score
  const riskScore = calculateRiskScore({
    churnRate,
    cashConversionCycle,
    inventoryTurnoverRatio,
    profitabilityIndex,
  });

  // Growth Potential
  const growthPotential = calculateGrowthPotential({
    customerRetentionRate,
    returnOnInvestment,
    inventoryTurnoverRatio,
  });

  return {
    customerLifetimeValue,
    customerRetentionRate,
    churnRate,
    inventoryTurnoverRatio,
    cashConversionCycle,
    operatingCashFlow,
    returnOnInvestment,
    breakEvenPoint,
    profitabilityIndex,
    marketBasketAnalysis,
    seasonalityIndex,
    demandElasticity,
    priceOptimization,
    riskScore,
    growthPotential,
  };
}

// Market Basket Analysis
function analyzeMarketBasket(sales: any[]) {
  const combinations: any = {};
  
  sales.forEach(sale => {
    if (sale.product) {
      const key = sale.product.name;
      if (!combinations[key]) {
        combinations[key] = { product: key, frequency: 0, revenue: 0 };
      }
      combinations[key].frequency++;
      combinations[key].revenue += sale.totalAmount;
    }
  });

  return Object.values(combinations)
    .sort((a: any, b: any) => b.frequency - a.frequency)
    .slice(0, 5);
}

// Seasonality Calculation
function calculateSeasonality(sales: any[], days: number) {
  const weeklyData: any = {};
  
  sales.forEach(sale => {
    const week = Math.floor((new Date().getTime() - sale.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!weeklyData[week]) {
      weeklyData[week] = { week, sales: 0, revenue: 0 };
    }
    weeklyData[week].sales++;
    weeklyData[week].revenue += sale.totalAmount;
  });

  return Object.values(weeklyData).slice(0, 12);
}

// Demand Elasticity
function calculateDemandElasticity(sales: any[]) {
  if (sales.length < 2) return 0;
  
  const avgPrice = sales.reduce((sum, s) => sum + (s.totalAmount / s.quantity), 0) / sales.length;
  const avgQuantity = sales.reduce((sum, s) => sum + s.quantity, 0) / sales.length;
  
  return avgPrice > 0 ? (avgQuantity / avgPrice) * -1 : 0;
}

// Price Optimization
function optimizePricing(sales: any[]) {
  const productPricing: any = {};
  
  sales.forEach(sale => {
    if (sale.product) {
      const productId = sale.productId;
      if (!productPricing[productId]) {
        productPricing[productId] = {
          name: sale.product.name,
          currentPrice: sale.totalAmount / sale.quantity,
          sales: 0,
          revenue: 0,
        };
      }
      productPricing[productId].sales += sale.quantity;
      productPricing[productId].revenue += sale.totalAmount;
    }
  });

  return Object.values(productPricing).map((p: any) => ({
    ...p,
    optimalPrice: p.currentPrice * 1.1,
    potentialRevenue: p.revenue * 1.15,
    recommendation: 'Narxni 10% oshirish tavsiya etiladi',
  })).slice(0, 5);
}

// Risk Score Calculation (0-100)
function calculateRiskScore(data: any): number {
  let score = 0;
  
  // Churn rate risk
  if (data.churnRate > 30) score += 30;
  else if (data.churnRate > 20) score += 20;
  else if (data.churnRate > 10) score += 10;
  
  // Cash conversion cycle risk
  if (data.cashConversionCycle > 60) score += 25;
  else if (data.cashConversionCycle > 45) score += 15;
  else if (data.cashConversionCycle > 30) score += 5;
  
  // Inventory turnover risk
  if (data.inventoryTurnoverRatio < 2) score += 25;
  else if (data.inventoryTurnoverRatio < 4) score += 15;
  else if (data.inventoryTurnoverRatio < 6) score += 5;
  
  // Profitability risk
  if (data.profitabilityIndex < 0) score += 20;
  else if (data.profitabilityIndex < 0.1) score += 10;
  
  return Math.min(score, 100);
}

// Growth Potential Calculation (0-100)
function calculateGrowthPotential(data: any): number {
  let score = 0;
  
  // Retention rate potential
  if (data.customerRetentionRate > 80) score += 30;
  else if (data.customerRetentionRate > 60) score += 20;
  else if (data.customerRetentionRate > 40) score += 10;
  
  // ROI potential
  if (data.returnOnInvestment > 50) score += 35;
  else if (data.returnOnInvestment > 30) score += 25;
  else if (data.returnOnInvestment > 15) score += 15;
  
  // Inventory efficiency potential
  if (data.inventoryTurnoverRatio > 8) score += 35;
  else if (data.inventoryTurnoverRatio > 6) score += 25;
  else if (data.inventoryTurnoverRatio > 4) score += 15;
  
  return Math.min(score, 100);
}

// Anomaliya Aniqlash
export function detectAnomalies(dailyTrends: any[], sales: any[]) {
  const anomalies: any[] = [];
  
  if (dailyTrends.length < 7) return anomalies;
  
  const avgRevenue = dailyTrends.reduce((sum, d) => sum + d.revenue, 0) / dailyTrends.length;
  const stdDev = Math.sqrt(
    dailyTrends.reduce((sum, d) => sum + Math.pow(d.revenue - avgRevenue, 2), 0) / dailyTrends.length
  );
  
  dailyTrends.forEach((day, index) => {
    const zScore = (day.revenue - avgRevenue) / stdDev;
    
    if (Math.abs(zScore) > 2) {
      anomalies.push({
        date: day.date,
        type: zScore > 0 ? 'spike' : 'drop',
        severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
        value: day.revenue,
        expected: avgRevenue,
        deviation: ((day.revenue - avgRevenue) / avgRevenue * 100).toFixed(1),
        message: zScore > 0 
          ? `${day.date} kuni daromad kutilganidan ${Math.abs(zScore * 100).toFixed(0)}% yuqori`
          : `${day.date} kuni daromad kutilganidan ${Math.abs(zScore * 100).toFixed(0)}% past`,
      });
    }
  });
  
  return anomalies;
}

// Mahsulot Tavsiyalari
export function generateProductRecommendations(productSales: any, sales: any[], totalRevenue: number) {
  const recommendations: any[] = [];
  const products = Object.values(productSales);
  
  products.forEach((product: any) => {
    const share = (product.revenue / totalRevenue) * 100;
    
    // High performer
    if (share > 30) {
      recommendations.push({
        product: product.name,
        type: 'optimize',
        priority: 'high',
        message: `${product.name} eng ko'p daromad keltirmoqda (${share.toFixed(1)}%)`,
        action: 'Zaxirani oshiring va marketing kampaniyalarini kuchaytiring',
        potentialImpact: 'Daromadni 15-20% oshirish mumkin',
      });
    }
    
    // Low performer
    if (share < 5 && product.sales > 5) {
      recommendations.push({
        product: product.name,
        type: 'improve',
        priority: 'medium',
        message: `${product.name} past natija ko'rsatmoqda (${share.toFixed(1)}%)`,
        action: 'Narxni qayta ko\'rib chiqing yoki marketing strategiyasini o\'zgartiring',
        potentialImpact: 'Sotuvni 2x oshirish mumkin',
      });
    }
    
    // Fast mover
    if (product.sales > 20) {
      recommendations.push({
        product: product.name,
        type: 'expand',
        priority: 'high',
        message: `${product.name} tez sotilmoqda (${product.sales} ta sotuv)`,
        action: 'Ishlab chiqarishni oshiring va yangi bozorlarni qidiring',
        potentialImpact: 'Bozor ulushini 25% oshirish mumkin',
      });
    }
  });
  
  return recommendations.slice(0, 5);
}

// Mijozlar Segmentatsiyasi
export function segmentCustomers(customers: any[], sales: any[]) {
  const segments = {
    vip: { count: 0, revenue: 0, customers: [] as any[] },
    loyal: { count: 0, revenue: 0, customers: [] as any[] },
    regular: { count: 0, revenue: 0, customers: [] as any[] },
    atrisk: { count: 0, revenue: 0, customers: [] as any[] },
    inactive: { count: 0, revenue: 0, customers: [] as any[] },
  };
  
  customers.forEach(customer => {
    const customerSales = sales.filter(s => s.customerId === customer.id);
    const totalSpent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const purchaseCount = customerSales.length;
    const lastPurchase = customerSales.length > 0 
      ? Math.max(...customerSales.map(s => s.createdAt.getTime()))
      : 0;
    const daysSinceLastPurchase = lastPurchase > 0 
      ? (Date.now() - lastPurchase) / (1000 * 60 * 60 * 24)
      : 999;
    
    let segment: keyof typeof segments;
    
    if (totalSpent > 10000 && purchaseCount > 10) {
      segment = 'vip';
    } else if (purchaseCount > 5 && daysSinceLastPurchase < 30) {
      segment = 'loyal';
    } else if (purchaseCount > 2 && daysSinceLastPurchase < 60) {
      segment = 'regular';
    } else if (purchaseCount > 0 && daysSinceLastPurchase > 60 && daysSinceLastPurchase < 120) {
      segment = 'atrisk';
    } else {
      segment = 'inactive';
    }
    
    segments[segment].count++;
    segments[segment].revenue += totalSpent;
    segments[segment].customers.push({
      name: customer.name,
      spent: totalSpent,
      purchases: purchaseCount,
    });
  });
  
  return {
    vip: { ...segments.vip, label: 'VIP Mijozlar', color: '#FFD700' },
    loyal: { ...segments.loyal, label: 'Sodiq Mijozlar', color: '#10b981' },
    regular: { ...segments.regular, label: 'Oddiy Mijozlar', color: '#3b82f6' },
    atrisk: { ...segments.atrisk, label: 'Xavf Ostida', color: '#f59e0b' },
    inactive: { ...segments.inactive, label: 'Nofaol', color: '#ef4444' },
  };
}

// Xavf Baholash
export function assessBusinessRisks(metrics: any, advancedMetrics: any, dailyTrends: any[]) {
  const risks: any[] = [];
  
  // Financial risks
  if (advancedMetrics.profitabilityIndex < 0.1) {
    risks.push({
      category: 'financial',
      severity: 'high',
      title: 'Past Rentabellik',
      description: 'Foyda darajasi juda past, biznes zarar ko\'rish xavfi yuqori',
      impact: 'Biznes barqarorligiga katta tahdid',
      mitigation: 'Xarajatlarni kamaytiring va daromad manbalarini diversifikatsiya qiling',
    });
  }
  
  if (advancedMetrics.cashConversionCycle > 60) {
    risks.push({
      category: 'financial',
      severity: 'medium',
      title: 'Naqd Pul Oqimi Muammosi',
      description: 'Naqd pulni qaytarish davri juda uzoq',
      impact: 'Likvidlik muammolari yuzaga kelishi mumkin',
      mitigation: 'Qarzlarni tezroq yig\'ing va to\'lovlarni kechiktiring',
    });
  }
  
  // Customer risks
  if (advancedMetrics.churnRate > 25) {
    risks.push({
      category: 'customer',
      severity: 'high',
      title: 'Yuqori Mijozlar Yo\'qotish Darajasi',
      description: `${advancedMetrics.churnRate.toFixed(1)}% mijozlar ketmoqda`,
      impact: 'Uzoq muddatli daromad kamayishi',
      mitigation: 'Mijozlar qoniqish dasturini ishlab chiqing va sodiqlik dasturlarini joriy eting',
    });
  }
  
  // Operational risks
  if (advancedMetrics.inventoryTurnoverRatio < 3) {
    risks.push({
      category: 'operational',
      severity: 'medium',
      title: 'Past Inventar Aylanishi',
      description: 'Mahsulotlar sekin sotilmoqda',
      impact: 'Kapital muzlatilishi va saqlash xarajatlari oshishi',
      mitigation: 'Inventar boshqaruvini yaxshilang va marketing faoliyatini oshiring',
    });
  }
  
  // Market risks
  const revenueVolatility = calculateVolatility(dailyTrends);
  if (revenueVolatility > 0.3) {
    risks.push({
      category: 'market',
      severity: 'medium',
      title: 'Daromad Beqarorligi',
      description: 'Daromad juda o\'zgaruvchan',
      impact: 'Prognoz qilish qiyin, rejalashtirish muammolari',
      mitigation: 'Daromad manbalarini diversifikatsiya qiling va barqaror mijozlar bazasini yarating',
    });
  }
  
  return {
    totalRisks: risks.length,
    riskScore: advancedMetrics.riskScore,
    riskLevel: advancedMetrics.riskScore > 60 ? 'high' : advancedMetrics.riskScore > 30 ? 'medium' : 'low',
    risks,
  };
}

function calculateVolatility(dailyTrends: any[]): number {
  if (dailyTrends.length < 2) return 0;
  
  const revenues = dailyTrends.map(d => d.revenue);
  const avg = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
  const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / revenues.length;
  const stdDev = Math.sqrt(variance);
  
  return avg > 0 ? stdDev / avg : 0;
}

// Strategik Tavsiyalar
export function generateStrategicRecommendations(
  advancedMetrics: any,
  riskAssessment: any,
  customerSegments: any,
  productRecommendations: any[]
) {
  const recommendations: any[] = [];
  
  // Growth strategy
  if (advancedMetrics.growthPotential > 70) {
    recommendations.push({
      category: 'growth',
      priority: 'high',
      title: 'Kengayish Imkoniyati',
      description: 'Biznesingiz yuqori o\'sish potentsialiga ega',
      actions: [
        'Yangi bozorlarni o\'rganish',
        'Mahsulot liniyasini kengaytirish',
        'Marketing byudjetini oshirish',
        'Yangi filiallar ochish',
      ],
      expectedImpact: 'Daromadni 30-50% oshirish mumkin',
      timeframe: '6-12 oy',
    });
  }
  
  // Customer retention
  if (customerSegments.atrisk.count > customerSegments.vip.count) {
    recommendations.push({
      category: 'retention',
      priority: 'high',
      title: 'Mijozlarni Saqlab Qolish',
      description: 'Ko\'p mijozlar xavf ostida',
      actions: [
        'Sodiqlik dasturini joriy eting',
        'Maxsus chegirmalar va takliflar',
        'Mijozlar bilan muntazam aloqa',
        'Xizmat sifatini yaxshilash',
      ],
      expectedImpact: 'Churn rate ni 15-20% kamaytirish',
      timeframe: '3-6 oy',
    });
  }
  
  // Operational efficiency
  if (advancedMetrics.inventoryTurnoverRatio < 5) {
    recommendations.push({
      category: 'efficiency',
      priority: 'medium',
      title: 'Operatsion Samaradorlik',
      description: 'Inventar boshqaruvini yaxshilash kerak',
      actions: [
        'Just-in-time inventar tizimini joriy eting',
        'Sekin sotiladigan mahsulotlarni kamaytiring',
        'Yetkazib beruvchilar bilan muzokaralar',
        'Avtomatlashtirish tizimlarini joriy eting',
      ],
      expectedImpact: 'Xarajatlarni 10-15% kamaytirish',
      timeframe: '3-6 oy',
    });
  }
  
  // Pricing strategy
  if (advancedMetrics.priceOptimization.length > 0) {
    recommendations.push({
      category: 'pricing',
      priority: 'medium',
      title: 'Narx Strategiyasi',
      description: 'Narxlarni optimallashtirish orqali daromadni oshirish',
      actions: [
        'Dinamik narxlash tizimini joriy eting',
        'Premium mahsulotlar uchun narxni oshiring',
        'Bundle takliflarini yarating',
        'Mavsumiy narxlash strategiyasini qo\'llang',
      ],
      expectedImpact: 'Daromadni 10-20% oshirish',
      timeframe: '1-3 oy',
    });
  }
  
  // Risk mitigation
  if (riskAssessment.riskLevel === 'high') {
    recommendations.push({
      category: 'risk',
      priority: 'critical',
      title: 'Xavflarni Kamaytirish',
      description: 'Biznes yuqori xavf ostida',
      actions: [
        'Moliyaviy zaxiralarni oshiring',
        'Xarajatlarni qisqartiring',
        'Daromad manbalarini diversifikatsiya qiling',
        'Naqd pul oqimini yaxshilang',
      ],
      expectedImpact: 'Biznes barqarorligini ta\'minlash',
      timeframe: 'Zudlik bilan',
    });
  }
  
  return recommendations;
}

// AI Confidence Score
export function calculateAIConfidence(dataPoints: number, days: number): number {
  const minDataPoints = 30;
  const optimalDataPoints = 100;
  
  if (dataPoints < minDataPoints) {
    return Math.min((dataPoints / minDataPoints) * 50, 50);
  }
  
  if (dataPoints >= optimalDataPoints) {
    return 95;
  }
  
  return 50 + ((dataPoints - minDataPoints) / (optimalDataPoints - minDataPoints)) * 45;
}
