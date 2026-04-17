/**
 * 🧠 ULTRA INTELLIGENCE ENGINE
 * Machine Learning va Advanced AI
 */

export interface MLPrediction {
  nextMonthRevenue: number;
  confidence: number;
  trend: 'GROWING' | 'STABLE' | 'DECLINING';
  factors: string[];
}

export interface CompetitorAnalysis {
  marketPosition: 'LEADER' | 'CHALLENGER' | 'FOLLOWER';
  competitiveAdvantage: string[];
  threats: string[];
  opportunities: string[];
  swotScore: number;
}

export interface AutomatedDecisions {
  priceAdjustments: any[];
  inventoryOrders: any[];
  marketingCampaigns: any[];
  staffingRecommendations: any[];
}

/**
 * MACHINE LEARNING - Daromad Bashorati
 */
export function predictRevenue(historicalData: any[]): MLPrediction {
  if (historicalData.length < 7) {
    return {
      nextMonthRevenue: 0,
      confidence: 0,
      trend: 'STABLE',
      factors: ['Ma\'lumot yetarli emas']
    };
  }

  // Linear Regression
  const n = historicalData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  historicalData.forEach((data, index) => {
    const x = index;
    const y = data.revenue;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Keyingi oy bashorati
  const nextMonthRevenue = slope * n + intercept;
  
  // Trend aniqlash
  const recentAvg = historicalData.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
  const oldAvg = historicalData.slice(0, 7).reduce((sum, d) => sum + d.revenue, 0) / 7;
  const growthRate = ((recentAvg - oldAvg) / oldAvg) * 100;
  
  let trend: 'GROWING' | 'STABLE' | 'DECLINING' = 'STABLE';
  if (growthRate > 10) trend = 'GROWING';
  else if (growthRate < -10) trend = 'DECLINING';
  
  // Confidence Score (R-squared)
  const yMean = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  
  historicalData.forEach((data, index) => {
    const yPred = slope * index + intercept;
    ssTotal += Math.pow(data.revenue - yMean, 2);
    ssResidual += Math.pow(data.revenue - yPred, 2);
  });
  
  const rSquared = 1 - (ssResidual / ssTotal);
  const confidence = Math.max(0, Math.min(100, rSquared * 100));
  
  // Omillar
  const factors = [];
  if (trend === 'GROWING') factors.push('📈 O\'sish trendi kuchli');
  if (trend === 'DECLINING') factors.push('📉 Pasayish trendi');
  if (confidence > 80) factors.push('✅ Yuqori ishonch darajasi');
  if (confidence < 50) factors.push('⚠️ Past ishonch darajasi');
  
  return {
    nextMonthRevenue: Math.max(0, nextMonthRevenue),
    confidence: Math.round(confidence),
    trend,
    factors
  };
}

/**
 * COMPETITOR ANALYSIS - Raqobatchilar tahlili
 */
export function analyzeCompetitivePosition(
  marketShare: number,
  growthRate: number,
  profitMargin: number,
  customerSatisfaction: number
): CompetitorAnalysis {
  let marketPosition: 'LEADER' | 'CHALLENGER' | 'FOLLOWER' = 'FOLLOWER';
  
  if (marketShare > 30 && growthRate > 15) marketPosition = 'LEADER';
  else if (marketShare > 15 || growthRate > 20) marketPosition = 'CHALLENGER';
  
  const competitiveAdvantage = [];
  const threats = [];
  const opportunities = [];
  
  // Ustunliklar
  if (profitMargin > 20) competitiveAdvantage.push('💰 Yuqori foyda marjasi');
  if (growthRate > 15) competitiveAdvantage.push('📈 Tez o\'sish');
  if (customerSatisfaction > 80) competitiveAdvantage.push('😊 Mijozlar mamnunligi');
  
  // Tahdidlar
  if (profitMargin < 10) threats.push('⚠️ Past foyda marjasi');
  if (growthRate < 5) threats.push('📉 Sekin o\'sish');
  if (marketShare < 10) threats.push('🎯 Kichik bozor ulushi');
  
  // Imkoniyatlar
  if (growthRate > 10) opportunities.push('🚀 Kengayish imkoniyati');
  if (customerSatisfaction > 70) opportunities.push('💎 Sodiq mijozlar bazasi');
  if (profitMargin > 15) opportunities.push('💰 Investitsiya imkoniyati');
  
  // SWOT Score
  const swotScore = (
    (marketShare / 100) * 25 +
    (Math.min(growthRate, 30) / 30) * 25 +
    (profitMargin / 100) * 25 +
    (customerSatisfaction / 100) * 25
  );
  
  return {
    marketPosition,
    competitiveAdvantage,
    threats,
    opportunities,
    swotScore: Math.round(swotScore)
  };
}

/**
 * AUTOMATED DECISIONS - Avtomatik qarorlar
 */
export function generateAutomatedDecisions(
  products: any[],
  customers: any[],
  sales: any[],
  metrics: any
): AutomatedDecisions {
  const priceAdjustments: any[] = [];
  const inventoryOrders: any[] = [];
  const marketingCampaigns: any[] = [];
  const staffingRecommendations: any[] = [];
  
  // 1. Narx o'zgartirishlari
  products.forEach(product => {
    const productSales = sales.filter(s => 
      s.items?.some((i: any) => i.productId === product.id)
    );
    
    const demand = productSales.length;
    const stockLevel = product.currentStock / product.optimalStock;
    
    // Yuqori talab + kam zaxira = narx oshirish
    if (demand > 20 && stockLevel < 0.3) {
      priceAdjustments.push({
        productId: product.id,
        productName: product.name,
        currentPrice: product.pricePerBag,
        recommendedPrice: product.pricePerBag * 1.1,
        reason: 'Yuqori talab, kam zaxira',
        expectedImpact: '+15% daromad',
        confidence: 85
      });
    }
    
    // Past talab + ko'p zaxira = narx pasaytirish
    if (demand < 5 && stockLevel > 1.5) {
      priceAdjustments.push({
        productId: product.id,
        productName: product.name,
        currentPrice: product.pricePerBag,
        recommendedPrice: product.pricePerBag * 0.9,
        reason: 'Past talab, ko\'p zaxira',
        expectedImpact: '+30% sotuvlar',
        confidence: 75
      });
    }
  });
  
  // 2. Avtomatik buyurtmalar
  products.forEach(product => {
    const daysOfStock = product.currentStock / Math.max(1, product.avgDailySales || 1);
    
    if (daysOfStock < 7) {
      inventoryOrders.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        recommendedOrder: product.optimalStock - product.currentStock,
        urgency: daysOfStock < 3 ? 'CRITICAL' : 'HIGH',
        estimatedCost: (product.optimalStock - product.currentStock) * product.pricePerBag * 0.6,
        deliveryTime: '3-5 kun'
      });
    }
  });
  
  // 3. Marketing kampaniyalari
  const inactiveCustomers = customers.filter(c => {
    const lastSale = c.sales?.[0];
    if (!lastSale) return true;
    const daysSinceLastSale = (Date.now() - new Date(lastSale.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSale > 60;
  });
  
  if (inactiveCustomers.length > 10) {
    marketingCampaigns.push({
      type: 'RE_ENGAGEMENT',
      target: 'Nofaol mijozlar',
      customerCount: inactiveCustomers.length,
      channel: 'SMS + Email',
      message: '🎁 Maxsus 20% chegirma! Qaytib keling!',
      budget: inactiveCustomers.length * 50, // 50 so'm/mijoz
      expectedROI: '300%',
      confidence: 70
    });
  }
  
  // VIP mijozlar uchun
  const vipCustomers = customers.filter(c => {
    const totalSpent = c.sales?.reduce((sum: number, s: any) => sum + s.totalAmount, 0) || 0;
    return totalSpent > 10000;
  });
  
  if (vipCustomers.length > 5) {
    marketingCampaigns.push({
      type: 'VIP_LOYALTY',
      target: 'VIP mijozlar',
      customerCount: vipCustomers.length,
      channel: 'Telegram + SMS',
      message: '💎 VIP maxsus taklif: 25% chegirma + bepul yetkazib berish',
      budget: vipCustomers.length * 100,
      expectedROI: '500%',
      confidence: 90
    });
  }
  
  // 4. Xodimlar tavsiyalari
  const avgDailySales = sales.length / 30;
  const optimalStaffCount = Math.ceil(avgDailySales / 10); // 10 sotuv/xodim
  
  staffingRecommendations.push({
    currentStaff: 5, // Placeholder
    recommendedStaff: optimalStaffCount,
    reason: avgDailySales > 50 ? 'Yuqori sotuv hajmi' : 'Optimal xodimlar soni',
    action: optimalStaffCount > 5 ? 'Yangi xodim yollash' : 'Hozirgi holat optimal',
    expectedImpact: optimalStaffCount > 5 ? '+20% samaradorlik' : 'Barqaror'
  });
  
  return {
    priceAdjustments: priceAdjustments.slice(0, 10),
    inventoryOrders: inventoryOrders.slice(0, 10),
    marketingCampaigns,
    staffingRecommendations
  };
}

/**
 * SENTIMENT ANALYSIS - Mijozlar kayfiyati tahlili
 */
export function analyzeSentiment(customerFeedback: string[]): {
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  score: number;
  keywords: { word: string; count: number }[];
} {
  const positiveWords = ['yaxshi', 'ajoyib', 'zo\'r', 'mukammal', 'rahmat', 'mamnun'];
  const negativeWords = ['yomon', 'past', 'qo\'pol', 'kech', 'xato', 'muammo'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  const wordCount: any = {};
  
  customerFeedback.forEach(feedback => {
    const words = feedback.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
      
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
  });
  
  const totalSentiment = positiveCount + negativeCount;
  const score = totalSentiment > 0 ? (positiveCount / totalSentiment) * 100 : 50;
  
  let overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
  if (score > 60) overallSentiment = 'POSITIVE';
  else if (score < 40) overallSentiment = 'NEGATIVE';
  
  const keywords = Object.entries(wordCount)
    .map(([word, count]) => ({ word, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return { overallSentiment, score: Math.round(score), keywords };
}

/**
 * PATTERN RECOGNITION - Naqsh aniqlash
 */
export function recognizePatterns(sales: any[]): {
  weeklyPattern: any[];
  monthlyPattern: any[];
  seasonalPattern: any[];
  insights: string[];
} {
  const weeklyPattern = Array(7).fill(0).map((_, day) => ({
    day: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][day],
    sales: 0,
    revenue: 0
  }));
  
  const monthlyPattern = Array(12).fill(0).map((_, month) => ({
    month: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
            'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][month],
    sales: 0,
    revenue: 0
  }));
  
  sales.forEach(sale => {
    const date = new Date(sale.createdAt);
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    
    weeklyPattern[dayOfWeek].sales++;
    weeklyPattern[dayOfWeek].revenue += sale.totalAmount;
    
    monthlyPattern[month].sales++;
    monthlyPattern[month].revenue += sale.totalAmount;
  });
  
  const insights = [];
  
  // Eng yaxshi kun
  const bestDay = weeklyPattern.reduce((max, day) => 
    day.revenue > max.revenue ? day : max
  );
  insights.push(`📅 Eng yaxshi kun: ${bestDay.day} ($${bestDay.revenue.toFixed(2)})`);
  
  // Eng yaxshi oy
  const bestMonth = monthlyPattern.reduce((max, month) => 
    month.revenue > max.revenue ? month : max
  );
  insights.push(`📆 Eng yaxshi oy: ${bestMonth.month} ($${bestMonth.revenue.toFixed(2)})`);
  
  return {
    weeklyPattern,
    monthlyPattern,
    seasonalPattern: monthlyPattern,
    insights
  };
}

export default {
  predictRevenue,
  analyzeCompetitivePosition,
  generateAutomatedDecisions,
  analyzeSentiment,
  recognizePatterns
};
