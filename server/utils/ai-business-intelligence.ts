import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateBusinessIntelligence(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Barcha ma'lumotlarni parallel yuklash
  const [
    sales, expenses, products, customers, tasks, 
    productionBatches, qualityChecks, rawMaterials, suppliers
  ] = await Promise.all([
    prisma.sale.findMany({ where: { createdAt: { gte: startDate } }, include: { customer: true, items: true } }),
    prisma.expense.findMany({ where: { createdAt: { gte: startDate } } }),
    prisma.product.findMany({ include: { sales: { where: { createdAt: { gte: startDate } } } } }),
    prisma.customer.findMany({ include: { sales: { where: { createdAt: { gte: startDate } } } } }),
    prisma.task.findMany({ where: { createdAt: { gte: startDate } } }),
    prisma.productionBatch.findMany({ where: { createdAt: { gte: startDate } } }),
    prisma.qualityCheck.findMany({ where: { createdAt: { gte: startDate } } }),
    prisma.rawMaterial.findMany(),
    prisma.supplier.findMany()
  ]);

  // 1. ISHLAR VA VAZIFALAR TAHLILI
  const tasksAnalysis = analyzeTasksPerformance(tasks);

  // 2. ISHLAB CHIQARISH SAMARADORLIGI
  const productionEfficiency = analyzeProductionEfficiency(productionBatches, qualityChecks);

  // 3. XODIMLAR SAMARADORLIGI
  const employeePerformance = analyzeEmployeePerformance(sales, tasks);

  // 4. OMBOR VA ZAXIRA TAHLILI
  const inventoryIntelligence = analyzeInventoryIntelligence(products, rawMaterials);

  // 5. YETKAZIB BERUVCHILAR TAHLILI
  const supplierAnalysis = analyzeSuppliers(suppliers, rawMaterials);

  // 6. MOLIYAVIY SOGLIQ
  const financialHealth = analyzeFinancialHealth(sales, expenses);

  // 7. BIZNES JARAYONLARI
  const processEfficiency = analyzeBusinessProcesses(sales, productionBatches, tasks);

  // 8. PROGNOZLAR VA TAVSIYALAR
  const predictions = generatePredictions(sales, expenses, products);

  // 9. REAL-TIME MONITORING
  const realTimeMetrics = getRealTimeMetrics(sales, tasks, productionBatches);

  // 10. AI TAVSIYALAR
  const aiRecommendations = generateAIRecommendations({
    tasksAnalysis,
    productionEfficiency,
    employeePerformance,
    inventoryIntelligence,
    financialHealth
  });

  return {
    overview: {
      totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      netProfit: sales.reduce((sum, s) => sum + s.totalAmount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
      activeTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
      productionBatches: productionBatches.length,
      qualityScore: calculateQualityScore(qualityChecks),
    },
    tasksAnalysis,
    productionEfficiency,
    employeePerformance,
    inventoryIntelligence,
    supplierAnalysis,
    financialHealth,
    processEfficiency,
    predictions,
    realTimeMetrics,
    aiRecommendations,
    generatedAt: new Date(),
    aiConfidence: calculateAIConfidence({
      dataQuality: calculateDataQuality(sales, tasks, productionBatches),
      sampleSize: sales.length + tasks.length,
      timeRange: days
    })
  };
}

function analyzeTasksPerformance(tasks: any[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = tasks.filter(t => t.status === 'PENDING').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  const overdueRate = total > 0 ? (overdue / total) * 100 : 0;

  // O'rtacha bajarish vaqti
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.completedAt);
  const avgCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.completedAt).getTime();
        return sum + (end - start);
      }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // kunlarda
    : 0;

  // Prioritet bo'yicha
  const byPriority = {
    high: tasks.filter(t => t.priority === 'HIGH').length,
    medium: tasks.filter(t => t.priority === 'MEDIUM').length,
    low: tasks.filter(t => t.priority === 'LOW').length,
  };

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate,
    overdueRate,
    avgCompletionTime,
    byPriority,
    performance: completionRate > 80 ? 'excellent' : completionRate > 60 ? 'good' : 'needs_improvement',
    insights: generateTaskInsights(completionRate, overdueRate, avgCompletionTime)
  };
}

function analyzeProductionEfficiency(batches: any[], qualityChecks: any[]) {
  const totalBatches = batches.length;
  const completedBatches = batches.filter(b => b.status === 'COMPLETED').length;
  const inProgressBatches = batches.filter(b => b.status === 'IN_PROGRESS').length;

  const totalProduced = batches.reduce((sum, b) => sum + (b.actualQuantity || 0), 0);
  const totalPlanned = batches.reduce((sum, b) => sum + b.plannedQuantity, 0);
  const efficiencyRate = totalPlanned > 0 ? (totalProduced / totalPlanned) * 100 : 0;

  // Sifat ko'rsatkichlari
  const passedChecks = qualityChecks.filter(q => q.status === 'PASSED').length;
  const failedChecks = qualityChecks.filter(q => q.status === 'FAILED').length;
  const qualityRate = qualityChecks.length > 0 ? (passedChecks / qualityChecks.length) * 100 : 0;

  // O'rtacha ishlab chiqarish vaqti
  const avgProductionTime = completedBatches.length > 0
    ? batches.filter(b => b.status === 'COMPLETED' && b.endDate).reduce((sum, b) => {
        const start = new Date(b.startDate).getTime();
        const end = new Date(b.endDate).getTime();
        return sum + (end - start);
      }, 0) / completedBatches.length / (1000 * 60 * 60) // soatlarda
    : 0;

  return {
    totalBatches,
    completedBatches,
    inProgressBatches,
    totalProduced,
    totalPlanned,
    efficiencyRate,
    qualityRate,
    avgProductionTime,
    performance: efficiencyRate > 90 && qualityRate > 95 ? 'excellent' : 
                 efficiencyRate > 75 && qualityRate > 85 ? 'good' : 'needs_improvement',
    insights: generateProductionInsights(efficiencyRate, qualityRate, avgProductionTime)
  };
}

function analyzeEmployeePerformance(sales: any[], tasks: any[]) {
  // Sotuvchilar samaradorligi
  const salesByUser: any = {};
  sales.forEach(sale => {
    if (!salesByUser[sale.userId]) {
      salesByUser[sale.userId] = { count: 0, revenue: 0, avgDeal: 0 };
    }
    salesByUser[sale.userId].count++;
    salesByUser[sale.userId].revenue += sale.totalAmount;
  });

  Object.keys(salesByUser).forEach(userId => {
    salesByUser[userId].avgDeal = salesByUser[userId].revenue / salesByUser[userId].count;
  });

  // Vazifalar bo'yicha
  const tasksByUser: any = {};
  tasks.forEach(task => {
    if (task.assignedTo) {
      if (!tasksByUser[task.assignedTo]) {
        tasksByUser[task.assignedTo] = { total: 0, completed: 0, overdue: 0 };
      }
      tasksByUser[task.assignedTo].total++;
      if (task.status === 'COMPLETED') tasksByUser[task.assignedTo].completed++;
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED') {
        tasksByUser[task.assignedTo].overdue++;
      }
    }
  });

  // Top performers
  const topSellers = Object.entries(salesByUser)
    .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([userId, data]: any) => ({ userId, ...data }));

  return {
    salesByUser,
    tasksByUser,
    topSellers,
    totalEmployees: new Set([...Object.keys(salesByUser), ...Object.keys(tasksByUser)]).size,
    insights: generateEmployeeInsights(salesByUser, tasksByUser)
  };
}

function analyzeInventoryIntelligence(products: any[], rawMaterials: any[]) {
  // Mahsulotlar tahlili
  const lowStockProducts = products.filter(p => p.quantity < 10);
  const outOfStockProducts = products.filter(p => p.quantity === 0);
  const overstockedProducts = products.filter(p => p.quantity > 100);

  // Xom ashyo tahlili
  const lowStockMaterials = rawMaterials.filter(m => m.quantity < m.minQuantity);
  const criticalMaterials = rawMaterials.filter(m => m.quantity < m.minQuantity * 0.5);

  // Zaxira qiymati
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalMaterialsValue = rawMaterials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);

  // Aylanma tezligi (turnover)
  const fastMoving = products.filter(p => p.sales && p.sales.length > 10);
  const slowMoving = products.filter(p => p.sales && p.sales.length < 3);

  return {
    products: {
      total: products.length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      overstocked: overstockedProducts.length,
      value: totalInventoryValue
    },
    rawMaterials: {
      total: rawMaterials.length,
      lowStock: lowStockMaterials.length,
      critical: criticalMaterials.length,
      value: totalMaterialsValue
    },
    movement: {
      fastMoving: fastMoving.length,
      slowMoving: slowMoving.length
    },
    alerts: [
      ...lowStockProducts.map(p => ({ type: 'low_stock', item: p.name, quantity: p.quantity })),
      ...criticalMaterials.map(m => ({ type: 'critical_material', item: m.name, quantity: m.quantity }))
    ],
    insights: generateInventoryInsights(lowStockProducts, criticalMaterials, slowMoving)
  };
}

function analyzeSuppliers(suppliers: any[], rawMaterials: any[]) {
  const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;
  const totalSuppliers = suppliers.length;

  // Yetkazib beruvchilar bo'yicha xom ashyo
  const materialsBySupplier: any = {};
  rawMaterials.forEach(m => {
    if (m.supplierId) {
      if (!materialsBySupplier[m.supplierId]) {
        materialsBySupplier[m.supplierId] = { count: 0, value: 0 };
      }
      materialsBySupplier[m.supplierId].count++;
      materialsBySupplier[m.supplierId].value += m.quantity * m.unitPrice;
    }
  });

  return {
    total: totalSuppliers,
    active: activeSuppliers,
    materialsBySupplier,
    insights: generateSupplierInsights(activeSuppliers, totalSuppliers)
  };
}

function analyzeFinancialHealth(sales: any[], expenses: any[]) {
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Naqd pul oqimi
  const cashFlow = {
    inflow: sales.reduce((sum, s) => sum + s.paidAmount, 0),
    outflow: totalExpenses,
    net: sales.reduce((sum, s) => sum + s.paidAmount, 0) - totalExpenses
  };

  // Qarzlar
  const totalDebt = sales.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
  const debtRatio = totalRevenue > 0 ? (totalDebt / totalRevenue) * 100 : 0;

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: netProfit,
    profitMargin,
    cashFlow,
    debt: totalDebt,
    debtRatio,
    health: profitMargin > 20 && debtRatio < 30 ? 'excellent' :
            profitMargin > 10 && debtRatio < 50 ? 'good' : 'needs_attention',
    insights: generateFinancialInsights(profitMargin, debtRatio, cashFlow.net)
  };
}

function analyzeBusinessProcesses(sales: any[], batches: any[], tasks: any[]) {
  // Buyurtmadan yetkazib berishgacha vaqt
  const avgOrderTime = sales.length > 0
    ? sales.reduce((sum, s) => {
        const orderDate = new Date(s.createdAt).getTime();
        const now = new Date().getTime();
        return sum + (now - orderDate);
      }, 0) / sales.length / (1000 * 60 * 60 * 24)
    : 0;

  // Ishlab chiqarish tsikli
  const avgProductionCycle = batches.filter(b => b.endDate).length > 0
    ? batches.filter(b => b.endDate).reduce((sum, b) => {
        const start = new Date(b.startDate).getTime();
        const end = new Date(b.endDate).getTime();
        return sum + (end - start);
      }, 0) / batches.filter(b => b.endDate).length / (1000 * 60 * 60 * 24)
    : 0;

  // Vazifalar bajarish tsikli
  const avgTaskCycle = tasks.filter(t => t.completedAt).length > 0
    ? tasks.filter(t => t.completedAt).reduce((sum, t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.completedAt).getTime();
        return sum + (end - start);
      }, 0) / tasks.filter(t => t.completedAt).length / (1000 * 60 * 60 * 24)
    : 0;

  return {
    avgOrderTime,
    avgProductionCycle,
    avgTaskCycle,
    efficiency: avgOrderTime < 7 && avgProductionCycle < 5 && avgTaskCycle < 3 ? 'excellent' :
                avgOrderTime < 14 && avgProductionCycle < 10 && avgTaskCycle < 7 ? 'good' : 'needs_improvement',
    insights: generateProcessInsights(avgOrderTime, avgProductionCycle, avgTaskCycle)
  };
}

function generatePredictions(sales: any[], expenses: any[], products: any[]) {
  // Oddiy linear regression
  const revenueByDay: any = {};
  sales.forEach(s => {
    const date = new Date(s.createdAt).toISOString().split('T')[0];
    revenueByDay[date] = (revenueByDay[date] || 0) + s.totalAmount;
  });

  const revenues = Object.values(revenueByDay) as number[];
  const avgRevenue = revenues.length > 0 ? revenues.reduce((a: number, b: number) => a + b, 0) / revenues.length : 0;

  // Keyingi 30 kun prognozi
  const nextMonthRevenue = avgRevenue * 30;
  const nextMonthExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length * 30;
  const predictedProfit = nextMonthRevenue - nextMonthExpenses;

  // Mahsulotlar tugash prognozi
  const stockoutPredictions = products
    .filter(p => p.sales && p.sales.length > 0)
    .map(p => {
      const avgDailySales = p.sales.length / 30;
      const daysUntilStockout = avgDailySales > 0 ? p.quantity / avgDailySales : 999;
      return { product: p.name, daysUntilStockout, urgent: daysUntilStockout < 7 };
    })
    .filter(p => p.daysUntilStockout < 30)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

  return {
    nextMonth: {
      revenue: nextMonthRevenue,
      expenses: nextMonthExpenses,
      profit: predictedProfit,
      profitMargin: nextMonthRevenue > 0 ? (predictedProfit / nextMonthRevenue) * 100 : 0
    },
    stockoutPredictions,
    insights: generatePredictionInsights(predictedProfit, stockoutPredictions)
  };
}

function getRealTimeMetrics(sales: any[], tasks: any[], batches: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    today: {
      sales: sales.filter(s => new Date(s.createdAt) >= today).length,
      revenue: sales.filter(s => new Date(s.createdAt) >= today).reduce((sum, s) => sum + s.totalAmount, 0),
      tasksCompleted: tasks.filter(t => t.completedAt && new Date(t.completedAt) >= today).length,
      batchesStarted: batches.filter(b => new Date(b.startDate) >= today).length
    },
    thisHour: {
      sales: sales.filter(s => new Date(s.createdAt).getTime() > now.getTime() - 3600000).length,
      revenue: sales.filter(s => new Date(s.createdAt).getTime() > now.getTime() - 3600000)
        .reduce((sum, s) => sum + s.totalAmount, 0)
    }
  };
}

function generateAIRecommendations(data: any) {
  const recommendations = [];

  // Vazifalar bo'yicha
  if (data.tasksAnalysis.overdueRate > 20) {
    recommendations.push({
      priority: 'high',
      category: 'tasks',
      title: 'Muddati o\'tgan vazifalar ko\'p',
      description: `${data.tasksAnalysis.overdue} ta vazifa muddati o'tgan. Jamoani qayta tashkil qilish kerak.`,
      action: 'Vazifalarni qayta taqsimlang va prioritetlarni belgilang'
    });
  }

  // Ishlab chiqarish bo'yicha
  if (data.productionEfficiency.efficiencyRate < 80) {
    recommendations.push({
      priority: 'high',
      category: 'production',
      title: 'Ishlab chiqarish samaradorligi past',
      description: `Samaradorlik ${data.productionEfficiency.efficiencyRate.toFixed(1)}%. Maqsad: 90%+`,
      action: 'Ishlab chiqarish jarayonlarini optimallashtiring'
    });
  }

  // Ombor bo'yicha
  if (data.inventoryIntelligence.products.lowStock > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'inventory',
      title: 'Zaxira kam mahsulotlar ko\'p',
      description: `${data.inventoryIntelligence.products.lowStock} ta mahsulot zaxirasi kam.`,
      action: 'Tezda buyurtma bering yoki ishlab chiqarishni oshiring'
    });
  }

  // Moliyaviy bo'yicha
  if (data.financialHealth.profitMargin < 15) {
    recommendations.push({
      priority: 'high',
      category: 'financial',
      title: 'Foyda marjasi past',
      description: `Foyda marjasi ${data.financialHealth.profitMargin.toFixed(1)}%. Maqsad: 20%+`,
      action: 'Xarajatlarni kamaytiring yoki narxlarni ko\'taring'
    });
  }

  return recommendations;
}

// Helper functions
function calculateQualityScore(checks: any[]) {
  if (checks.length === 0) return 100;
  const passed = checks.filter(c => c.status === 'PASSED').length;
  return (passed / checks.length) * 100;
}

function calculateAIConfidence(params: any) {
  const { dataQuality, sampleSize, timeRange } = params;
  let confidence = 50;

  if (dataQuality > 0.8) confidence += 20;
  if (sampleSize > 100) confidence += 15;
  if (timeRange >= 30) confidence += 15;

  return Math.min(confidence, 95);
}

function calculateDataQuality(sales: any[], tasks: any[], batches: any[]) {
  const totalRecords = sales.length + tasks.length + batches.length;
  if (totalRecords === 0) return 0;

  const completeRecords = [
    ...sales.filter(s => s.customer && s.items && s.items.length > 0),
    ...tasks.filter(t => t.assignedTo && t.dueDate),
    ...batches.filter(b => b.startDate && b.plannedQuantity > 0)
  ].length;

  return completeRecords / totalRecords;
}

function generateTaskInsights(completionRate: number, overdueRate: number, avgTime: number) {
  const insights = [];
  if (completionRate > 80) insights.push('Vazifalar bajarilishi yuqori darajada');
  if (overdueRate > 20) insights.push('Muddati o\'tgan vazifalar ko\'p - e\'tibor bering');
  if (avgTime < 3) insights.push('Vazifalar tez bajarilmoqda');
  return insights;
}

function generateProductionInsights(efficiency: number, quality: number, time: number) {
  const insights = [];
  if (efficiency > 90) insights.push('Ishlab chiqarish samaradorligi a\'lo');
  if (quality > 95) insights.push('Sifat nazorati yuqori darajada');
  if (time < 24) insights.push('Ishlab chiqarish tezligi yaxshi');
  return insights;
}

function generateEmployeeInsights(sales: any, tasks: any) {
  const insights = [];
  const employeeCount = Object.keys(sales).length;
  if (employeeCount > 0) insights.push(`${employeeCount} ta faol sotuvchi`);
  return insights;
}

function generateInventoryInsights(lowStock: any[], critical: any[], slow: any[]) {
  const insights = [];
  if (lowStock.length > 0) insights.push(`${lowStock.length} ta mahsulot zaxirasi kam`);
  if (critical.length > 0) insights.push(`${critical.length} ta kritik xom ashyo`);
  if (slow.length > 5) insights.push('Sekin sotilayotgan mahsulotlar ko\'p');
  return insights;
}

function generateSupplierInsights(active: number, total: number) {
  const insights = [];
  if (active === total) insights.push('Barcha yetkazib beruvchilar faol');
  return insights;
}

function generateFinancialInsights(margin: number, debt: number, cashFlow: number) {
  const insights = [];
  if (margin > 20) insights.push('Foyda marjasi yaxshi');
  if (debt > 50) insights.push('Qarzlar yuqori - e\'tibor bering');
  if (cashFlow > 0) insights.push('Naqd pul oqimi ijobiy');
  return insights;
}

function generateProcessInsights(order: number, production: number, task: number) {
  const insights = [];
  if (order < 7) insights.push('Buyurtmalar tez bajarilmoqda');
  if (production < 5) insights.push('Ishlab chiqarish tsikli optimal');
  if (task < 3) insights.push('Vazifalar tez hal qilinmoqda');
  return insights;
}

function generatePredictionInsights(profit: number, stockouts: any[]) {
  const insights = [];
  if (profit > 0) insights.push('Keyingi oy foydali bo\'ladi');
  if (stockouts.length > 0) insights.push(`${stockouts.length} ta mahsulot tez orada tugaydi`);
  return insights;
}
