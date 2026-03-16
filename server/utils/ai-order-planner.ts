import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Qop va dona konvertatsiya
export function convertBagsToUnits(bags: number, unitsPerBag: number): number {
  return bags * unitsPerBag;
}

export function convertUnitsToBags(units: number, unitsPerBag: number): { bags: number; remainingUnits: number } {
  const bags = Math.floor(units / unitsPerBag);
  const remainingUnits = units % unitsPerBag;
  return { bags, remainingUnits };
}

// AI Buyurtma Tahlili va Rejalashtirish
export async function analyzeOrderAndCreatePlan(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: true
    }
  });

  if (!order) throw new Error('Buyurtma topilmadi');

  // 1. OMBOR TEKSHIRUVI
  const inventoryCheck = await checkInventoryAvailability(order.items);

  // 2. ISHLAB CHIQARISH VAQTINI HISOBLASH
  const productionTime = calculateProductionTime(order.items);

  // 3. OPTIMAL REJA YARATISH
  const planType = determinePlanType(order.requestedDate);

  // 4. AI TAVSIYALARI
  const recommendations = generateAIRecommendations(inventoryCheck, productionTime, order);

  // 5. ISHONCH DARAJASI
  const aiConfidence = calculateAIConfidence(inventoryCheck, productionTime);

  // 6. REJA YARATISH
  const plan = await prisma.productionPlan.create({
    data: {
      orderId: order.id,
      planType,
      startDate: calculateStartDate(order.requestedDate, productionTime),
      endDate: order.requestedDate,
      totalBags: order.items.reduce((sum, item) => sum + item.quantityBags, 0),
      totalUnits: order.items.reduce((sum, item) => sum + item.quantityUnits, 0),
      aiConfidence,
      inventoryCheck: JSON.stringify(inventoryCheck),
      recommendations: JSON.stringify(recommendations),
      status: 'DRAFT'
    }
  });

  // 7. VAZIFALAR YARATISH
  await createProductionTasks(plan.id, order.items, inventoryCheck);

  return {
    plan,
    inventoryCheck,
    recommendations,
    aiConfidence
  };
}

// Ombor mavjudligini tekshirish
async function checkInventoryAvailability(items: any[]) {
  const results = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product) continue;

    const requiredBags = item.quantityBags;
    const requiredUnits = item.quantityUnits;
    const totalRequiredUnits = convertBagsToUnits(requiredBags, product.unitsPerBag) + requiredUnits;

    const availableBags = product.currentStock;
    const availableUnits = product.currentUnits;
    const totalAvailableUnits = convertBagsToUnits(availableBags, product.unitsPerBag) + availableUnits;

    const shortage = Math.max(0, totalRequiredUnits - totalAvailableUnits);
    const shortageInBags = convertUnitsToBags(shortage, product.unitsPerBag);

    results.push({
      productId: product.id,
      productName: product.name,
      required: {
        bags: requiredBags,
        units: requiredUnits,
        totalUnits: totalRequiredUnits
      },
      available: {
        bags: availableBags,
        units: availableUnits,
        totalUnits: totalAvailableUnits
      },
      shortage: {
        bags: shortageInBags.bags,
        units: shortageInBags.remainingUnits,
        totalUnits: shortage
      },
      status: shortage === 0 ? 'AVAILABLE' : shortage < totalRequiredUnits * 0.5 ? 'PARTIAL' : 'UNAVAILABLE',
      needsProduction: shortage > 0
    });
  }

  return results;
}

// Ishlab chiqarish vaqtini hisoblash
function calculateProductionTime(items: any[]): number {
  // Har bir mahsulot uchun taxminiy vaqt (soatlarda)
  const baseTimePerBag = 0.1; // 6 daqiqa/qop
  const setupTime = 2; // 2 soat tayyorgarlik

  const totalBags = items.reduce((sum, item) => sum + item.quantityBags, 0);
  const productionTime = totalBags * baseTimePerBag + setupTime;

  return Math.ceil(productionTime); // Soatlarda
}

// Reja turini aniqlash
function determinePlanType(requestedDate: Date): string {
  const now = new Date();
  const diffHours = (requestedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 24) return 'IMMEDIATE';
  if (diffHours <= 48) return 'TOMORROW';
  if (diffHours <= 168) return 'WEEK'; // 7 kun
  return 'MONTH';
}

// Boshlanish sanasini hisoblash
function calculateStartDate(requestedDate: Date, productionTimeHours: number): Date {
  const startDate = new Date(requestedDate);
  startDate.setHours(startDate.getHours() - productionTimeHours - 4); // 4 soat buffer
  return startDate;
}

// AI Tavsiyalari
function generateAIRecommendations(inventoryCheck: any[], productionTime: number, order: any) {
  const recommendations = [];

  // 1. Ombor tavsiyalari
  const unavailableItems = inventoryCheck.filter(item => item.status === 'UNAVAILABLE');
  const partialItems = inventoryCheck.filter(item => item.status === 'PARTIAL');

  if (unavailableItems.length > 0) {
    recommendations.push({
      type: 'CRITICAL',
      category: 'INVENTORY',
      title: 'Omborda mahsulot yetarli emas',
      description: `${unavailableItems.length} ta mahsulot uchun ishlab chiqarish zarur`,
      action: 'Darhol ishlab chiqarishni boshlang',
      priority: 'HIGH'
    });
  }

  if (partialItems.length > 0) {
    recommendations.push({
      type: 'WARNING',
      category: 'INVENTORY',
      title: 'Qisman yetarli mahsulotlar',
      description: `${partialItems.length} ta mahsulot qisman mavjud`,
      action: 'Qo\'shimcha ishlab chiqarish rejalashtiring',
      priority: 'MEDIUM'
    });
  }

  // 2. Vaqt tavsiyalari
  const planType = determinePlanType(order.requestedDate);
  if (planType === 'IMMEDIATE') {
    recommendations.push({
      type: 'URGENT',
      category: 'TIME',
      title: 'Tezkor buyurtma',
      description: 'Buyurtma 24 soat ichida kerak',
      action: 'Barcha resurslarni jalb qiling, smenalarni oshiring',
      priority: 'URGENT'
    });
  }

  // 3. Ishlab chiqarish tavsiyalari
  if (productionTime > 16) {
    recommendations.push({
      type: 'INFO',
      category: 'PRODUCTION',
      title: 'Uzoq ishlab chiqarish vaqti',
      description: `Taxminiy vaqt: ${productionTime} soat`,
      action: '2 smena rejimida ishlashni ko\'rib chiqing',
      priority: 'MEDIUM'
    });
  }

  // 4. Mijoz tavsiyalari
  if (order.customer.debt > 10000) {
    recommendations.push({
      type: 'WARNING',
      category: 'CUSTOMER',
      title: 'Mijozning qarzi yuqori',
      description: `Joriy qarz: $${order.customer.debt.toFixed(2)}`,
      action: 'Oldindan to\'lov talab qiling',
      priority: 'HIGH'
    });
  }

  return recommendations;
}

// AI Ishonch Darajasi
function calculateAIConfidence(inventoryCheck: any[], productionTime: number): number {
  let confidence = 100;

  // Ombor mavjudligi
  const unavailableCount = inventoryCheck.filter(i => i.status === 'UNAVAILABLE').length;
  const partialCount = inventoryCheck.filter(i => i.status === 'PARTIAL').length;
  
  confidence -= unavailableCount * 20;
  confidence -= partialCount * 10;

  // Ishlab chiqarish vaqti
  if (productionTime > 24) confidence -= 10;
  if (productionTime > 48) confidence -= 10;

  return Math.max(0, Math.min(100, confidence));
}

// Ishlab chiqarish vazifalarini yaratish
async function createProductionTasks(planId: string, items: any[], inventoryCheck: any[]) {
  const tasks = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const check = inventoryCheck.find(c => c.productId === item.productId);

    if (!check || !check.needsProduction) continue;

    const task = await prisma.productionTask.create({
      data: {
        planId,
        productId: item.productId,
        productName: check.productName,
        quantityBags: check.shortage.bags,
        quantityUnits: check.shortage.units,
        priority: i + 1,
        status: 'PENDING'
      }
    });

    tasks.push(task);
  }

  return tasks;
}

// Buyurtmani tasdiqlash va rejani faollashtirish
export async function approveOrderAndPlan(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { productionPlan: true }
  });

  if (!order) throw new Error('Buyurtma topilmadi');
  if (!order.productionPlan) throw new Error('Reja topilmadi');

  // Buyurtmani tasdiqlash
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CONFIRMED' }
  });

  // Rejani faollashtirish
  await prisma.productionPlan.update({
    where: { id: order.productionPlan.id },
    data: { status: 'APPROVED' }
  });

  // Ishlab chiqarish buyruqlarini yaratish
  const tasks = await prisma.productionTask.findMany({
    where: { planId: order.productionPlan.id }
  });

  for (const task of tasks) {
    await prisma.productionOrder.create({
      data: {
        orderNumber: `PO-${Date.now()}-${task.id.slice(0, 8)}`,
        productId: task.productId,
        targetQuantity: task.quantityBags,
        status: 'PLANNED',
        plannedDate: order.productionPlan.startDate,
        shift: 'DAY',
        supervisorId: 'AUTO',
        notes: `Buyurtma #${order.orderNumber} uchun`
      }
    });
  }

  return { success: true, message: 'Buyurtma tasdiqlandi va ishlab chiqarish boshlandi' };
}

// Statistika va hisobotlar
export async function getOrderStatistics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate } },
    include: { items: true, productionPlan: true }
  });

  const stats = {
    total: orders.length,
    byStatus: {
      pending: orders.filter(o => o.status === 'PENDING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      inProduction: orders.filter(o => o.status === 'IN_PRODUCTION').length,
      ready: orders.filter(o => o.status === 'READY').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length
    },
    byPriority: {
      low: orders.filter(o => o.priority === 'LOW').length,
      normal: orders.filter(o => o.priority === 'NORMAL').length,
      high: orders.filter(o => o.priority === 'HIGH').length,
      urgent: orders.filter(o => o.priority === 'URGENT').length
    },
    avgAIConfidence: orders
      .filter(o => o.productionPlan)
      .reduce((sum, o) => sum + (o.productionPlan?.aiConfidence || 0), 0) / 
      orders.filter(o => o.productionPlan).length || 0,
    totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    avgDeliveryTime: calculateAvgDeliveryTime(orders)
  };

  return stats;
}

function calculateAvgDeliveryTime(orders: any[]): number {
  const delivered = orders.filter(o => o.deliveredDate && o.createdAt);
  if (delivered.length === 0) return 0;

  const totalTime = delivered.reduce((sum, o) => {
    const diff = new Date(o.deliveredDate).getTime() - new Date(o.createdAt).getTime();
    return sum + diff;
  }, 0);

  return totalTime / delivered.length / (1000 * 60 * 60 * 24); // Kunlarda
}
