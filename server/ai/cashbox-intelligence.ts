import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🤖 AI Kassa Prognozi
export async function generateCashboxForecast(days: number = 7) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pastDays = 30;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - pastDays);

    // Tarixiy ma'lumotlar
    const transactions = await (prisma as any).cashboxTransaction.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' }
    });

    // Kunlik statistika
    const dailyStats: any = {};
    transactions.forEach((t: any) => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'INCOME') {
        dailyStats[date].income += t.amount;
      } else {
        dailyStats[date].expense += t.amount;
      }
      dailyStats[date].count++;
    });

    // O'rtacha hisoblash
    const values = Object.values(dailyStats) as any[];
    const avgIncome = values.reduce((sum, d) => sum + d.income, 0) / values.length;
    const avgExpense = values.reduce((sum, d) => sum + d.expense, 0) / values.length;
    const avgCount = values.reduce((sum, d) => sum + d.count, 0) / values.length;

    // Trend aniqlash (oxirgi 7 kun vs oldingi 7 kun)
    const recent7 = values.slice(-7);
    const previous7 = values.slice(-14, -7);
    
    const recentAvg = recent7.reduce((sum, d) => sum + d.income, 0) / 7;
    const previousAvg = previous7.reduce((sum, d) => sum + d.income, 0) / 7;
    const trend = recentAvg > previousAvg ? 'INCREASING' : recentAvg < previousAvg ? 'DECREASING' : 'STABLE';
    const trendPercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Prognoz
    const forecast = [];
    let currentBalance = await getCurrentBalance();
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Trend asosida prognoz
      const trendFactor = trend === 'INCREASING' ? 1.05 : trend === 'DECREASING' ? 0.95 : 1;
      const predictedIncome = avgIncome * trendFactor;
      const predictedExpense = avgExpense * trendFactor;
      const predictedNet = predictedIncome - predictedExpense;
      
      currentBalance += predictedNet;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedIncome: Math.round(predictedIncome),
        predictedExpense: Math.round(predictedExpense),
        predictedNet: Math.round(predictedNet),
        predictedBalance: Math.round(currentBalance),
        confidence: calculateConfidence(values.length, i)
      });
    }

    // Xavf baholash
    const risks = assessRisks(forecast, avgIncome, avgExpense);

    // Tavsiyalar
    const recommendations = generateRecommendations(forecast, risks, currentBalance);

    return {
      current: {
        balance: currentBalance,
        avgDailyIncome: Math.round(avgIncome),
        avgDailyExpense: Math.round(avgExpense),
        avgTransactions: Math.round(avgCount)
      },
      trend: {
        direction: trend,
        percent: Math.round(trendPercent * 10) / 10
      },
      forecast,
      risks,
      recommendations,
      confidence: calculateOverallConfidence(values.length),
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Cashbox forecast error:', error);
    throw error;
  }
}

// Hozirgi balansni olish
async function getCurrentBalance() {
  const transactions = await (prisma as any).cashboxTransaction.findMany();
  return transactions.reduce((sum: number, t: any) => {
    return sum + (t.type === 'INCOME' ? t.amount : -t.amount);
  }, 0);
}

// Ishonch darajasini hisoblash
function calculateConfidence(dataPoints: number, daysAhead: number): number {
  const baseConfidence = Math.min(dataPoints / 30, 1) * 100;
  const decayFactor = Math.pow(0.9, daysAhead - 1);
  return Math.round(baseConfidence * decayFactor);
}

function calculateOverallConfidence(dataPoints: number): string {
  if (dataPoints >= 30) return 'YUQORI';
  if (dataPoints >= 14) return 'O\'RTA';
  return 'PAST';
}

// Xavflarni baholash
function assessRisks(forecast: any[], avgIncome: number, avgExpense: number) {
  const risks = [];

  // Manfiy balans xavfi
  const negativeBalance = forecast.find(f => f.predictedBalance < 0);
  if (negativeBalance) {
    risks.push({
      type: 'MANFIY_BALANS',
      severity: 'YUQORI',
      date: negativeBalance.date,
      description: 'Kassada pul tugashi mumkin',
      impact: Math.abs(negativeBalance.predictedBalance)
    });
  }

  // Kam pul xavfi
  const lowBalance = forecast.find(f => f.predictedBalance < avgIncome * 2);
  if (lowBalance && !negativeBalance) {
    risks.push({
      type: 'KAM_PUL',
      severity: 'O\'RTA',
      date: lowBalance.date,
      description: 'Kassada kam pul qoladi',
      impact: lowBalance.predictedBalance
    });
  }

  // Ko'p pul xavfi (o'g'irlik xavfi)
  const highBalance = forecast.find(f => f.predictedBalance > avgIncome * 10);
  if (highBalance) {
    risks.push({
      type: 'KOP_PUL',
      severity: 'O\'RTA',
      date: highBalance.date,
      description: 'Kassada juda ko\'p pul',
      impact: highBalance.predictedBalance
    });
  }

  // Katta xarajat xavfi
  const highExpense = forecast.find(f => f.predictedExpense > avgExpense * 2);
  if (highExpense) {
    risks.push({
      type: 'KATTA_XARAJAT',
      severity: 'PAST',
      date: highExpense.date,
      description: 'Xarajatlar oshishi kutilmoqda',
      impact: highExpense.predictedExpense
    });
  }

  return risks;
}

// Tavsiyalar generatsiya qilish
function generateRecommendations(forecast: any[], risks: any[], currentBalance: number) {
  const recommendations = [];

  // Manfiy balans uchun
  if (risks.some(r => r.type === 'MANFIY_BALANS')) {
    recommendations.push({
      priority: 'YUQORI',
      action: 'BANK_OLIB_KELING',
      description: 'Tezda bankdan pul olib keling',
      amount: Math.abs(forecast.find(f => f.predictedBalance < 0)?.predictedBalance || 0) + 1000000,
      deadline: forecast.find(f => f.predictedBalance < 0)?.date
    });
  }

  // Kam pul uchun
  if (risks.some(r => r.type === 'KAM_PUL')) {
    recommendations.push({
      priority: 'O\'RTA',
      action: 'PUL_TAYYORLANG',
      description: 'Bankdan pul olishga tayyorlaning',
      amount: 2000000,
      deadline: forecast.find(f => f.predictedBalance < forecast[0].predictedIncome * 2)?.date
    });
  }

  // Ko'p pul uchun
  if (risks.some(r => r.type === 'KOP_PUL')) {
    const highBalance = forecast.find(f => f.predictedBalance > forecast[0].predictedIncome * 10);
    recommendations.push({
      priority: 'O\'RTA',
      action: 'BANKGA_OLIB_BORING',
      description: 'Ortiqcha pulni bankga olib boring',
      amount: Math.round((highBalance?.predictedBalance || 0) * 0.7),
      deadline: highBalance?.date
    });
  }

  // Optimal balans
  const optimalBalance = forecast[0].predictedIncome * 3;
  if (currentBalance < optimalBalance * 0.5) {
    recommendations.push({
      priority: 'PAST',
      action: 'OPTIMAL_BALANS',
      description: 'Optimal balansni saqlang',
      amount: optimalBalance,
      deadline: null
    });
  }

  return recommendations;
}

// 🔒 Xavfsizlik Tekshiruvi
export async function performSecurityCheck(userId: string) {
  try {
    const issues = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Katta tranzaksiyalar (shubhali)
    const largeTransactions = await (prisma as any).cashboxTransaction.findMany({
      where: {
        createdAt: { gte: today },
        amount: { gte: 5000000 }
      },
      include: { user: true }
    });

    if (largeTransactions.length > 0) {
      issues.push({
        type: 'KATTA_TRANZAKSIYA',
        severity: 'O\'RTA',
        count: largeTransactions.length,
        description: `${largeTransactions.length} ta katta tranzaksiya`,
        transactions: largeTransactions.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          user: t.user.name,
          time: t.createdAt
        }))
      });
    }

    // 2. Tez-tez tranzaksiyalar
    const recentTransactions = await (prisma as any).cashboxTransaction.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 3600000) } // oxirgi 1 soat
      }
    });

    if (recentTransactions.length > 20) {
      issues.push({
        type: 'TEZ_TEZ_TRANZAKSIYA',
        severity: 'YUQORI',
        count: recentTransactions.length,
        description: 'Oxirgi 1 soatda juda ko\'p tranzaksiya',
        recommendation: 'Foydalanuvchini tekshiring'
      });
    }

    // 3. Tunda amallar
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      const nightTransactions = await (prisma as any).cashboxTransaction.findMany({
        where: {
          createdAt: {
            gte: new Date(today.setHours(22, 0, 0, 0)),
            lte: new Date(today.setHours(6, 0, 0, 0))
          }
        }
      });

      if (nightTransactions.length > 0) {
        issues.push({
          type: 'TUNDA_AMAL',
          severity: 'YUQORI',
          count: nightTransactions.length,
          description: 'Ish vaqtidan tashqari amallar',
          recommendation: 'Managerga xabar bering'
        });
      }
    }

    // 4. Manfiy balans
    const balance = await getCurrentBalance();
    if (balance < 0) {
      issues.push({
        type: 'MANFIY_BALANS',
        severity: 'KRITIK',
        amount: balance,
        description: 'Kassada manfiy balans!',
        recommendation: 'Darhol tekshiring va to\'ldiring'
      });
    }

    // 5. Bir xil summa (shubhali pattern)
    const sameAmountTransactions = await findSameAmountPattern();
    if (sameAmountTransactions.length > 0) {
      issues.push({
        type: 'BIR_XIL_SUMMA',
        severity: 'O\'RTA',
        count: sameAmountTransactions.length,
        description: 'Ko\'p marta bir xil summa',
        recommendation: 'Pattern tekshiring'
      });
    }

    // Xavfsizlik reytingi
    const securityScore = calculateSecurityScore(issues);

    return {
      status: issues.length === 0 ? 'XAVFSIZ' : 'OGOHLANTIRISH',
      score: securityScore,
      issues,
      checkedAt: new Date(),
      recommendations: generateSecurityRecommendations(issues)
    };
  } catch (error) {
    console.error('Security check error:', error);
    throw error;
  }
}

// Bir xil summa patternini topish
async function findSameAmountPattern() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const transactions = await (prisma as any).cashboxTransaction.findMany({
    where: { createdAt: { gte: today } }
  });

  const amountCounts: any = {};
  transactions.forEach((t: any) => {
    amountCounts[t.amount] = (amountCounts[t.amount] || 0) + 1;
  });

  return Object.entries(amountCounts)
    .filter(([_, count]) => (count as number) >= 5)
    .map(([amount, count]) => ({ amount: parseFloat(amount), count }));
}

// Xavfsizlik reytingini hisoblash
function calculateSecurityScore(issues: any[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    if (issue.severity === 'KRITIK') score -= 30;
    else if (issue.severity === 'YUQORI') score -= 20;
    else if (issue.severity === 'O\'RTA') score -= 10;
    else score -= 5;
  });

  return Math.max(0, score);
}

// Xavfsizlik tavsiyalari
function generateSecurityRecommendations(issues: any[]) {
  const recommendations = [];

  if (issues.some(i => i.type === 'MANFIY_BALANS')) {
    recommendations.push({
      priority: 'KRITIK',
      action: 'Darhol kassani to\'ldiring va sababini aniqlang'
    });
  }

  if (issues.some(i => i.type === 'TEZ_TEZ_TRANZAKSIYA')) {
    recommendations.push({
      priority: 'YUQORI',
      action: 'Foydalanuvchi faoliyatini tekshiring'
    });
  }

  if (issues.some(i => i.type === 'TUNDA_AMAL')) {
    recommendations.push({
      priority: 'YUQORI',
      action: 'Tunda ishlashni cheklang yoki nazorat qiling'
    });
  }

  if (issues.some(i => i.type === 'KATTA_TRANZAKSIYA')) {
    recommendations.push({
      priority: 'O\'RTA',
      action: 'Katta tranzaksiyalar uchun tasdiqlash qo\'shing'
    });
  }

  return recommendations;
}

// 📊 Kassa Statistikasi
export async function getCashboxStatistics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await (prisma as any).cashboxTransaction.findMany({
    where: { createdAt: { gte: startDate } },
    include: { user: true }
  });

  const income = transactions.filter((t: any) => t.type === 'INCOME');
  const expense = transactions.filter((t: any) => t.type === 'EXPENSE');

  return {
    total: {
      transactions: transactions.length,
      income: income.reduce((sum: number, t: any) => sum + t.amount, 0),
      expense: expense.reduce((sum: number, t: any) => sum + t.amount, 0)
    },
    daily: {
      avgIncome: income.reduce((sum: number, t: any) => sum + t.amount, 0) / days,
      avgExpense: expense.reduce((sum: number, t: any) => sum + t.amount, 0) / days,
      avgTransactions: transactions.length / days
    },
    topUsers: getTopUsers(transactions),
    peakHours: getPeakHours(transactions)
  };
}

function getTopUsers(transactions: any[]) {
  const userStats: any = {};
  
  transactions.forEach(t => {
    if (!userStats[t.userId]) {
      userStats[t.userId] = {
        name: t.user.name,
        count: 0,
        total: 0
      };
    }
    userStats[t.userId].count++;
    userStats[t.userId].total += t.amount;
  });

  return Object.values(userStats)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);
}

function getPeakHours(transactions: any[]) {
  const hourStats: any = {};
  
  transactions.forEach(t => {
    const hour = new Date(t.createdAt).getHours();
    hourStats[hour] = (hourStats[hour] || 0) + 1;
  });

  return Object.entries(hourStats)
    .sort(([_, a], [__, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));
}
