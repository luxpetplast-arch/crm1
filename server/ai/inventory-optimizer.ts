/**
 * 🤖 AI OMBOR OPTIMIZATORI
 * 
 * Bu modul mahsulotlar uchun optimal zaxira miqdorini
 * sun'iy intellekt yordamida hisoblaydi.
 * 
 * Funksiyalar:
 * - Minimal zaxira hisoblash
 * - Maksimal zaxira hisoblash
 * - Optimal buyurtma nuqtasi
 * - Buyurtma miqdori tavsiyasi
 * - Mavsumiy tahlil
 * - Trend bashorati
 */

import { prisma } from '../utils/prisma';

interface InventoryAnalysis {
  productId: string;
  productName: string;
  currentStock: number;
  
  // Sotuvlar tahlili
  averageDailySales: number;
  averageWeeklySales: number;
  averageMonthlySales: number;
  salesTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  trendPercentage: number;
  
  // Mavsumiy tahlil
  seasonalFactor: number;
  peakSeason: string;
  lowSeason: string;
  
  // Yetkazib berish
  leadTimeDays: number;
  leadTimeVariability: number;
  
  // Tavsiyalar
  recommendedMinStock: number;
  recommendedOptimalStock: number;
  recommendedMaxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Xavfsizlik
  safetyStock: number;
  stockoutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  overstockRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Moliyaviy
  estimatedCost: number;
  potentialSavings: number;
  
  // AI ishonch darajasi
  confidenceScore: number;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  
  // Qo'shimcha
  lastAnalysisDate: Date;
  nextReviewDate: Date;
  warnings: string[];
  recommendations: string[];
}

/**
 * Mahsulot uchun to'liq AI tahlil
 */
export async function analyzeProductInventory(productId: string): Promise<InventoryAnalysis> {
  // 1. Mahsulot ma'lumotlarini olish
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sales: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 oy
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    throw new Error('Mahsulot topilmadi');
  }

  // 2. Sotuvlar tahlili
  const salesAnalysis = analyzeSalesPattern(product.sales);
  
  // 3. Mavsumiy tahlil
  const seasonalAnalysis = analyzeSeasonality(product.sales);
  
  // 4. Yetkazib berish tahlili
  const leadTimeAnalysis = analyzeLeadTime(productId);
  
  // 5. Optimal zaxira hisoblash
  const optimalStock = calculateOptimalStock(
    salesAnalysis,
    seasonalAnalysis,
    leadTimeAnalysis
  );
  
  // 6. Xavflar baholash
  const riskAssessment = assessRisks(
    product.currentStock,
    optimalStock,
    salesAnalysis
  );
  
  // 7. Tavsiyalar yaratish
  const recommendations = generateRecommendations(
    product,
    optimalStock,
    riskAssessment
  );

  return {
    productId: product.id,
    productName: product.name,
    currentStock: product.currentStock,
    
    ...salesAnalysis,
    ...seasonalAnalysis,
    ...leadTimeAnalysis,
    ...optimalStock,
    ...riskAssessment,
    ...recommendations,
    
    lastAnalysisDate: new Date(),
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta
  };
}

/**
 * Sotuvlar naqshini tahlil qilish
 */
function analyzeSalesPattern(sales: any[]) {
  if (sales.length === 0) {
    return {
      averageDailySales: 0,
      averageWeeklySales: 0,
      averageMonthlySales: 0,
      salesTrend: 'STABLE' as const,
      trendPercentage: 0,
      confidenceScore: 0,
      dataQuality: 'POOR' as const
    };
  }

  // Kunlik o'rtacha
  const totalDays = Math.max(1, (Date.now() - new Date(sales[sales.length - 1].createdAt).getTime()) / (24 * 60 * 60 * 1000));
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageDailySales = totalQuantity / totalDays;

  // Haftalik va oylik
  const averageWeeklySales = averageDailySales * 7;
  const averageMonthlySales = averageDailySales * 30;

  // Trend tahlili (oxirgi 30 kun vs oldingi 30 kun)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recentSales = sales.filter(s => new Date(s.createdAt).getTime() > thirtyDaysAgo);
  const previousSales = sales.filter(s => {
    const time = new Date(s.createdAt).getTime();
    return time > sixtyDaysAgo && time <= thirtyDaysAgo;
  });

  const recentTotal = recentSales.reduce((sum, s) => sum + s.quantity, 0);
  const previousTotal = previousSales.reduce((sum, s) => sum + s.quantity, 0);

  let salesTrend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
  let trendPercentage = 0;

  if (previousTotal > 0) {
    trendPercentage = ((recentTotal - previousTotal) / previousTotal) * 100;
    if (trendPercentage > 10) salesTrend = 'INCREASING';
    else if (trendPercentage < -10) salesTrend = 'DECREASING';
  }

  // Ma'lumotlar sifati
  let dataQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'POOR';
  if (sales.length > 100) dataQuality = 'EXCELLENT';
  else if (sales.length > 50) dataQuality = 'GOOD';
  else if (sales.length > 20) dataQuality = 'FAIR';

  // Ishonch darajasi
  const confidenceScore = Math.min(100, (sales.length / 100) * 100);

  return {
    averageDailySales: Math.round(averageDailySales * 10) / 10,
    averageWeeklySales: Math.round(averageWeeklySales * 10) / 10,
    averageMonthlySales: Math.round(averageMonthlySales * 10) / 10,
    salesTrend,
    trendPercentage: Math.round(trendPercentage * 10) / 10,
    confidenceScore: Math.round(confidenceScore),
    dataQuality
  };
}

/**
 * Mavsumiy tahlil
 */
function analyzeSeasonality(sales: any[]) {
  if (sales.length < 30) {
    return {
      seasonalFactor: 1.0,
      peakSeason: 'Ma\'lumot yetarli emas',
      lowSeason: 'Ma\'lumot yetarli emas'
    };
  }

  // Oylik sotuvlarni hisoblash
  const monthlySales: { [key: string]: number } = {};
  
  sales.forEach(sale => {
    const month = new Date(sale.createdAt).toLocaleString('uz-UZ', { month: 'long' });
    monthlySales[month] = (monthlySales[month] || 0) + sale.quantity;
  });

  // Eng yuqori va eng past oylarni topish
  const months = Object.entries(monthlySales);
  if (months.length === 0) {
    return {
      seasonalFactor: 1.0,
      peakSeason: 'Ma\'lumot yo\'q',
      lowSeason: 'Ma\'lumot yo\'q'
    };
  }

  const peakMonth = months.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  const lowMonth = months.reduce((min, curr) => curr[1] < min[1] ? curr : min);

  // Mavsumiy koeffitsient
  const avgSales = months.reduce((sum, [_, qty]) => sum + qty, 0) / months.length;
  const seasonalFactor = peakMonth[1] / avgSales;

  return {
    seasonalFactor: Math.round(seasonalFactor * 100) / 100,
    peakSeason: peakMonth[0],
    lowSeason: lowMonth[0]
  };
}

/**
 * Yetkazib berish vaqti tahlili
 */
function analyzeLeadTime(productId: string) {
  // Hozircha standart qiymatlar
  // Kelajakda yetkazuvchilar bilan integratsiya qilinadi
  return {
    leadTimeDays: 3, // 3 kun
    leadTimeVariability: 1 // ±1 kun
  };
}

/**
 * Optimal zaxira hisoblash
 */
function calculateOptimalStock(
  salesAnalysis: any,
  seasonalAnalysis: any,
  leadTimeAnalysis: any
) {
  const { averageDailySales, salesTrend, trendPercentage } = salesAnalysis;
  const { seasonalFactor } = seasonalAnalysis;
  const { leadTimeDays, leadTimeVariability } = leadTimeAnalysis;

  // Trend bo'yicha tuzatish
  let trendAdjustment = 1.0;
  if (salesTrend === 'INCREASING') {
    trendAdjustment = 1 + (trendPercentage / 100);
  } else if (salesTrend === 'DECREASING') {
    trendAdjustment = 1 + (trendPercentage / 100);
  }

  // Tuzatilgan kunlik sotuv
  const adjustedDailySales = averageDailySales * trendAdjustment * seasonalFactor;

  // Xavfsizlik zaxirasi (2 kunlik sotuv + variability)
  const safetyStock = Math.ceil(adjustedDailySales * (2 + leadTimeVariability));

  // Yetkazib berish davridagi sotuv
  const leadTimeDemand = Math.ceil(adjustedDailySales * leadTimeDays);

  // Qayta buyurtma nuqtasi
  const reorderPoint = leadTimeDemand + safetyStock;

  // Minimal zaxira (5 kunlik sotuv + xavfsizlik)
  const recommendedMinStock = Math.ceil(adjustedDailySales * 5) + safetyStock;

  // Optimal zaxira (10 kunlik sotuv)
  const recommendedOptimalStock = Math.ceil(adjustedDailySales * 10) + safetyStock;

  // Maksimal zaxira (20 kunlik sotuv)
  const recommendedMaxStock = Math.ceil(adjustedDailySales * 20) + safetyStock;

  // Buyurtma miqdori (optimal - minimal)
  const reorderQuantity = recommendedOptimalStock - recommendedMinStock;

  return {
    safetyStock,
    reorderPoint,
    recommendedMinStock,
    recommendedOptimalStock,
    recommendedMaxStock,
    reorderQuantity
  };
}

/**
 * Xavflarni baholash
 */
function assessRisks(
  currentStock: number,
  optimalStock: any,
  salesAnalysis: any
) {
  const { recommendedMinStock, recommendedMaxStock } = optimalStock;
  const { averageDailySales } = salesAnalysis;

  // Tugash xavfi
  let stockoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const daysOfStock = currentStock / Math.max(1, averageDailySales);
  
  if (daysOfStock < 3) stockoutRisk = 'HIGH';
  else if (daysOfStock < 7) stockoutRisk = 'MEDIUM';

  // Ortiqcha zaxira xavfi
  let overstockRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  
  if (currentStock > recommendedMaxStock * 1.5) overstockRisk = 'HIGH';
  else if (currentStock > recommendedMaxStock) overstockRisk = 'MEDIUM';

  return {
    stockoutRisk,
    overstockRisk
  };
}

/**
 * Tavsiyalar yaratish
 */
function generateRecommendations(
  product: any,
  optimalStock: any,
  riskAssessment: any
) {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  const { currentStock } = product;
  const { recommendedMinStock, recommendedOptimalStock, reorderPoint, reorderQuantity } = optimalStock;
  const { stockoutRisk, overstockRisk } = riskAssessment;

  // Tugash xavfi
  if (stockoutRisk === 'HIGH') {
    warnings.push('⚠️ SHOSHILINCH: Zaxira juda kam! Darhol buyurtma bering.');
    recommendations.push(`🚨 ${reorderQuantity} qop buyurtma qiling (24 soat ichida)`);
  } else if (stockoutRisk === 'MEDIUM') {
    warnings.push('⚠️ Zaxira kamaymoqda');
    recommendations.push(`📦 ${reorderQuantity} qop buyurtma qiling (3 kun ichida)`);
  }

  // Ortiqcha zaxira
  if (overstockRisk === 'HIGH') {
    warnings.push('💰 Ortiqcha zaxira: Pul muzlatilgan');
    recommendations.push('💡 Chegirma bering yoki yangi buyurtma bermang');
  } else if (overstockRisk === 'MEDIUM') {
    warnings.push('📊 Zaxira biroz ko\'p');
    recommendations.push('💡 Keyingi buyurtmani kechiktiring');
  }

  // Optimal holat
  if (currentStock >= recommendedMinStock && currentStock <= recommendedOptimalStock) {
    recommendations.push('✅ Zaxira optimal holatda');
  }

  // Buyurtma nuqtasi
  if (currentStock <= reorderPoint && stockoutRisk !== 'HIGH') {
    recommendations.push(`📍 Buyurtma nuqtasiga yetdingiz: ${reorderQuantity} qop buyurtma qiling`);
  }

  // Moliyaviy tavsiyalar
  const currentValue = currentStock * (product.pricePerBag || 0);
  const optimalValue = recommendedOptimalStock * (product.pricePerBag || 0);
  const potentialSavings = Math.abs(currentValue - optimalValue);

  if (potentialSavings > 0) {
    if (currentStock > recommendedOptimalStock) {
      recommendations.push(`💰 Zaxirani kamaytirib $${potentialSavings.toFixed(2)} tejash mumkin`);
    }
  }

  return {
    warnings,
    recommendations,
    estimatedCost: currentValue,
    potentialSavings
  };
}

/**
 * Barcha mahsulotlar uchun tahlil
 */
export async function analyzeAllProducts() {
  const products = await prisma.product.findMany({
    where: {
      currentStock: { gt: 0 }
    }
  });

  const analyses = await Promise.all(
    products.map(product => analyzeProductInventory(product.id))
  );

  return analyses;
}

/**
 * Xavfli mahsulotlarni topish
 */
export async function findRiskyProducts() {
  const analyses = await analyzeAllProducts();
  
  return {
    highStockoutRisk: analyses.filter(a => a.stockoutRisk === 'HIGH'),
    mediumStockoutRisk: analyses.filter(a => a.stockoutRisk === 'MEDIUM'),
    highOverstockRisk: analyses.filter(a => a.overstockRisk === 'HIGH'),
    needsReorder: analyses.filter(a => a.currentStock <= a.reorderPoint)
  };
}

/**
 * Buyurtma tavsiyalari
 */
export async function getOrderRecommendations() {
  const analyses = await analyzeAllProducts();
  
  const recommendations = analyses
    .filter(a => a.currentStock <= a.reorderPoint)
    .map(a => ({
      productId: a.productId,
      productName: a.productName,
      currentStock: a.currentStock,
      recommendedOrder: a.reorderQuantity,
      urgency: a.stockoutRisk,
      estimatedCost: a.reorderQuantity * (a.estimatedCost / Math.max(1, a.currentStock)),
      reason: a.warnings[0] || 'Zaxira kamaygan'
    }))
    .sort((a, b) => {
      // Shoshilinch birinchi
      const urgencyOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

  return recommendations;
}

export default {
  analyzeProductInventory,
  analyzeAllProducts,
  findRiskyProducts,
  getOrderRecommendations
};
