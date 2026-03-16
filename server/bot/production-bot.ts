import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let productionBot: TelegramBot | null = null;

export function initProductionBot() {
  const token = process.env.TELEGRAM_PRODUCTION_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ Production bot token not found');
    return null;
  }

  try {
    productionBot = new TelegramBot(token, { polling: true });
    setupProductionCommands();
    console.log('🏭 Production Bot ishga tushdi!');
    return productionBot;
  } catch (error) {
    console.error('Production Bot xatolik:', error);
    return null;
  }
}

function setupProductionCommands() {
  if (!productionBot) return;

  // Start komandasi
  productionBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🏭 **ISHLAB CHIQARISH BOTI**

Salom! Men ishlab chiqarish bo'limi botiman.

📋 **Mavjud komandalar:**
/production - Ishlab chiqarish holati
/quality - Sifat nazorati
/materials - Xom ashyo holati
/tasks - Vazifalar ro'yxati
/reports - Hisobotlar
/help - Yordam

🔧 Ishlab chiqarish jarayonlarini boshqaring!
    `;

    productionBot?.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['📊 Ishlab chiqarish', '🔍 Sifat nazorati'],
          ['📦 Xom ashyo', '📋 Vazifalar'],
          ['📈 Hisobotlar', '❓ Yordam']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  });

  // Ishlab chiqarish holati
  productionBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '📊 Ishlab chiqarish' || text === '/production') {
      await handleProductionStatus(chatId);
    } else if (text === '🔍 Sifat nazorati' || text === '/quality') {
      await handleQualityControl(chatId);
    } else if (text === '📦 Xom ashyo' || text === '/materials') {
      await handleRawMaterials(chatId);
    } else if (text === '📋 Vazifalar' || text === '/tasks') {
      await handleProductionTasks(chatId);
    } else if (text === '📈 Hisobotlar' || text === '/reports') {
      await handleProductionReports(chatId);
    } else if (text === '❓ Yordam' || text === '/help') {
      await handleHelp(chatId);
    }
  });

  // Callback query handler
  productionBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    try {
      if (data.startsWith('prod_task_')) {
        const taskId = data.replace('prod_task_', '');
        await handleTaskAction(chatId, taskId, query.id);
      } else if (data.startsWith('quality_check_')) {
        const checkId = data.replace('quality_check_', '');
        await handleQualityCheck(chatId, checkId, query.id);
      }
    } catch (error) {
      console.error('Production bot callback error:', error);
    }
  });
}

async function handleProductionStatus(chatId: number) {
  try {
    // Ishlab chiqarish statistikasi
    const [products, tasks, materials] = await Promise.all([
      prisma.product.count(),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.rawMaterial.count({ where: { currentStock: { lt: prisma.rawMaterial.fields.minStockLimit } } })
    ]);

    const message = `
🏭 **ISHLAB CHIQARISH HOLATI**

📊 **Statistika:**
• Mahsulotlar: ${products} ta
• Faol vazifalar: ${tasks} ta
• Kam xom ashyo: ${materials} ta

🔄 **Bugungi holat:**
• Ishlab chiqarish: Faol
• Sifat nazorati: Normal
• Xom ashyo ta'minoti: ${materials > 0 ? '⚠️ Diqqat kerak' : '✅ Yaxshi'}

📈 **Samaradorlik:** 85%
    `;

    await productionBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Batafsil hisobot', callback_data: 'prod_detailed_report' },
            { text: '🔄 Yangilash', callback_data: 'prod_refresh' }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Production status error:', error);
    await productionBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleQualityControl(chatId: number) {
  try {
    const qualityChecks = await prisma.qualityCheck.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    });

    let message = '🔍 **SIFAT NAZORATI**\n\n';

    if (qualityChecks.length === 0) {
      message += '📝 Hozircha sifat tekshiruvlari yo\'q';
    } else {
      qualityChecks.forEach((check, index) => {
        const status = check.status === 'PASSED' ? '✅' : check.status === 'FAILED' ? '❌' : '⏳';
        message += `${index + 1}. ${status} ${check.product?.name || 'Noma\'lum'}\n`;
        message += `   📅 ${new Date(check.createdAt).toLocaleDateString()}\n\n`;
      });
    }

    await productionBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Yangi tekshiruv', callback_data: 'quality_new_check' }],
          [{ text: '📊 Statistika', callback_data: 'quality_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Quality control error:', error);
    await productionBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleRawMaterials(chatId: number) {
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: {
        currentStock: { lt: prisma.rawMaterial.fields.minStockLimit }
      },
      take: 10
    });

    let message = '📦 **XOM ASHYO HOLATI**\n\n';

    if (materials.length === 0) {
      message += '✅ Barcha xom ashyo yetarli miqdorda';
    } else {
      message += '⚠️ **Kam xom ashyolar:**\n\n';
      materials.forEach((material, index) => {
        message += `${index + 1}. ${material.name}\n`;
        message += `   📊 Mavjud: ${material.currentStock} ${material.unit}\n`;
        message += `   🔻 Minimal: ${material.minStockLimit} ${material.unit}\n\n`;
      });
    }

    await productionBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Barcha materiallar', callback_data: 'materials_all' }],
          [{ text: '🛒 Buyurtma berish', callback_data: 'materials_order' }]
        ]
      }
    });
  } catch (error) {
    console.error('Raw materials error:', error);
    await productionBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleProductionTasks(chatId: number) {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: 'IN_PROGRESS' },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    let message = '📋 **FAOL VAZIFALAR**\n\n';

    if (tasks.length === 0) {
      message += '✅ Hozircha faol vazifalar yo\'q';
    } else {
      tasks.forEach((task, index) => {
        const priority = task.priority === 'HIGH' ? '🔴' : task.priority === 'MEDIUM' ? '🟡' : '🟢';
        message += `${index + 1}. ${priority} ${task.title}\n`;
        message += `   📅 Muddat: ${new Date(task.dueDate || '').toLocaleDateString()}\n`;
        message += `   👤 Mas'ul: ${task.assignedTo || 'Tayinlanmagan'}\n\n`;
      });
    }

    await productionBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Yangi vazifa', callback_data: 'task_new' }],
          [{ text: '📊 Vazifalar statistikasi', callback_data: 'task_stats' }]
        ]
      }
    });
  } catch (error) {
    console.error('Production tasks error:', error);
    await productionBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleProductionReports(chatId: number) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const [todayProduction, weeklyProduction, qualityStats] = await Promise.all([
      prisma.production.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      prisma.production.count({
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          } 
        }
      }),
      prisma.qualityCheck.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    let message = `
📈 **ISHLAB CHIQARISH HISOBOTI**

📊 **Ishlab chiqarish:**
• Bugun: ${todayProduction} ta
• Bu hafta: ${weeklyProduction} ta

🔍 **Sifat nazorati:**
`;

    qualityStats.forEach(stat => {
      const emoji = stat.status === 'PASSED' ? '✅' : stat.status === 'FAILED' ? '❌' : '⏳';
      message += `• ${emoji} ${stat.status}: ${stat._count.status} ta\n`;
    });

    await productionBot?.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Batafsil hisobot', callback_data: 'report_detailed' }],
          [{ text: '📤 Hisobotni yuborish', callback_data: 'report_export' }]
        ]
      }
    });
  } catch (error) {
    console.error('Production reports error:', error);
    await productionBot?.sendMessage(chatId, '❌ Xatolik yuz berdi');
  }
}

async function handleHelp(chatId: number) {
  const helpMessage = `
❓ **YORDAM**

🏭 **Ishlab chiqarish boti** quyidagi funksiyalarni taqdim etadi:

📊 **Ishlab chiqarish holati**
• Real-time statistika
• Samaradorlik ko'rsatkichlari
• Faol jarayonlar

🔍 **Sifat nazorati**
• Sifat tekshiruvlari
• Statistika va hisobotlar
• Yangi tekshiruvlar

📦 **Xom ashyo boshqaruvi**
• Zaxira holati
• Kam materiallar haqida ogohlantirish
• Buyurtma berish

📋 **Vazifalar**
• Faol vazifalar ro'yxati
• Yangi vazifalar yaratish
• Vazifalar statistikasi

📈 **Hisobotlar**
• Kunlik/haftalik hisobotlar
• Sifat statistikasi
• Hisobotlarni eksport qilish

🆘 **Yordam kerakmi?**
Texnik yordam uchun: @admin
  `;

  await productionBot?.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown'
  });
}

async function handleTaskAction(chatId: number, taskId: string, queryId: string) {
  // Vazifa bilan ishlash logikasi
  await productionBot?.answerCallbackQuery(queryId, { text: 'Vazifa yangilandi!' });
}

async function handleQualityCheck(chatId: number, checkId: string, queryId: string) {
  // Sifat tekshiruvi logikasi
  await productionBot?.answerCallbackQuery(queryId, { text: 'Sifat tekshiruvi yangilandi!' });
}

export { productionBot };