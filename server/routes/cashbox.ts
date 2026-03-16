import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const sales = await prisma.sale.findMany({
      where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
    });
    const expenses = await prisma.expense.findMany();
    const payments = await prisma.payment.findMany();

    const totalIncome = sales.reduce((sum, s) => sum + s.paidAmount, 0) + payments.reduce((sum, p) => sum + p.amount, 0);
    // Faqat musbat xarajatlarni hisoblaymiz (manfiy xarajatlar - kassa kirimlari)
    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0);
    // Jami balans o'rniga bugungi balansni qaytaramiz
    const totalBalance = todayIncome - todayExpense;

    const todaySales = sales.filter(s => s.createdAt >= today);
    const todayExpenses = expenses.filter(e => e.createdAt >= today);
    const todayPayments = payments.filter(p => p.createdAt >= today);
    const todayIncome = todaySales.reduce((sum, s) => sum + s.paidAmount, 0) + todayPayments.reduce((sum, p) => sum + p.amount, 0);
    // Faqat musbat bugungi xarajatlarni hisoblaymiz
    const todayExpense = todayExpenses.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0);

    const monthlySales = sales.filter(s => s.createdAt >= monthStart);
    const monthlyExpenses = expenses.filter(e => e.createdAt >= monthStart);
    const monthlyPayments = payments.filter(p => p.createdAt >= monthStart);
    const monthlyIncome = monthlySales.reduce((sum, s) => sum + s.paidAmount, 0) + monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    // Faqat musbat oylik xarajatlarni hisoblaymiz
    const monthlyExpense = monthlyExpenses.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0);

    // Valyuta bo'yicha hisoblash - ALOHIDA
    let cashUZS = 0, cashUSD = 0, cardUSD = 0, clickUZS = 0;
    
    // Sotuvlardan
    sales.forEach(sale => {
      if (sale.paymentDetails) {
        try {
          const details = JSON.parse(sale.paymentDetails);
          cashUZS += details.uzs || 0;
          cashUSD += details.usd || 0;
          clickUZS += details.click || 0;
        } catch (e) {}
      }
    });
    
    // To'lovlardan
    payments.forEach(payment => {
      if (payment.paymentDetails) {
        try {
          const details = JSON.parse(payment.paymentDetails);
          cashUZS += details.uzs || 0;
          cashUSD += details.usd || 0;
          clickUZS += details.click || 0;
        } catch (e) {}
      }
    });

    const dailyFlow = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const daySales = sales.filter(s => s.createdAt >= date && s.createdAt < nextDate);
      const dayExpenses = expenses.filter(e => e.createdAt >= date && e.createdAt < nextDate);
      const dayPayments = payments.filter(p => p.createdAt >= date && p.createdAt < nextDate);
      const income = daySales.reduce((sum, s) => sum + s.paidAmount, 0) + dayPayments.reduce((sum, p) => sum + p.amount, 0);
      // Faqat musbat kunlik xarajatlarni hisoblaymiz
      const expense = dayExpenses.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0);
      dailyFlow.push({
        date: date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
        income, expense, net: income - expense,
      });
    }

    res.json({ 
      totalBalance, 
      todayIncome, 
      todayExpense, 
      monthlyIncome, 
      monthlyExpense, 
      byCurrency: { 
        cashUZS,
        cashUSD, 
        cardUSD, 
        clickUZS 
      }, 
      dailyFlow 
    });
  } catch (error) {
    console.error('Cashbox summary error:', error);
    res.status(500).json({ error: 'Kassa malumotlarini yuklashda xatolik' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const sales = await prisma.sale.findMany({ where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } }, include: { customer: true }, orderBy: { createdAt: 'desc' }, take: limit });
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    const payments = await prisma.payment.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' }, take: limit });

    const getPaymentMethod = (paymentDetails: string | null): string => {
      if (!paymentDetails) return 'CASH';
      try {
        const details = JSON.parse(paymentDetails);
        if (details.click > 0) return 'CLICK';
        if (details.usd > 0) return 'CARD';
        if (details.uzs > 0) return 'CASH';
      } catch (e) {}
      return 'CASH';
    };

    const transactions = [
      ...sales.map(s => ({ id: `sale-${s.id}`, type: 'INCOME', amount: s.paidAmount, currency: s.currency, description: `Sotuv - ${s.customer?.name}`, paymentMethod: getPaymentMethod(s.paymentDetails), createdAt: s.createdAt })),
      ...expenses.map(e => ({ id: `expense-${e.id}`, type: 'EXPENSE', amount: e.amount, currency: e.currency, description: `${e.category} - ${e.description}`, paymentMethod: 'CASH', createdAt: e.createdAt })),
      ...payments.map(p => ({ id: `payment-${p.id}`, type: 'INCOME', amount: p.amount, currency: p.currency, description: `Qarz tolovi - ${p.customer?.name}`, paymentMethod: getPaymentMethod(p.paymentDetails), createdAt: p.createdAt })),
    ];

    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(transactions.slice(0, limit));
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Tranzaksiyalarni yuklashda xatolik' });
  }
});

router.post('/add', async (req: AuthRequest, res) => {
  try {
    const { amount, currency, type, description } = req.body;
    // Kassa kirim - manfiy expense yaratamiz (chunki expense xarajat)
    await prisma.expense.create({ 
      data: { 
        category: 'KASSA_KIRIM', 
        amount: -Math.abs(amount), 
        currency, 
        description: description || 'Kassa kirim', 
        userId: req.user!.id 
      } 
    });
    res.json({ success: true, message: 'Kassa muvaffaqiyatli toldirildi' });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Kassa toldirishda xatolik' });
  }
});

router.post('/withdraw', async (req: AuthRequest, res) => {
  try {
    const { amount, currency, type, description } = req.body;
    // Kassa chiqim - musbat expense yaratamiz
    await prisma.expense.create({ 
      data: { 
        category: 'KASSA_CHIQIM', 
        amount: Math.abs(amount), 
        currency, 
        description: description || 'Kassa chiqim', 
        userId: req.user!.id 
      } 
    });
    res.json({ success: true, message: 'Chiqim muvaffaqiyatli amalga oshirildi' });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Kassa chiqimida xatolik' });
  }
});

router.post('/transfer', async (req: AuthRequest, res) => {
  try {
    const { from, to, amount, description } = req.body;
    if (from === to) return res.status(400).json({ error: 'Bir xil tolov usullariga transfer qilib bolmaydi' });
    await prisma.expense.create({ data: { category: 'TRANSFER', amount: 0, currency: 'USD', description: description || `Transfer: ${from} to ${to} (${amount} USD)`, userId: req.user!.id } });
    res.json({ success: true, message: 'Transfer muvaffaqiyatli amalga oshirildi' });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer amalga oshirishda xatolik' });
  }
});

router.get('/export/pdf', async (req: AuthRequest, res) => {
  try {
    res.json({ message: 'PDF eksport tez orada qoshiladi' });
  } catch (error) {
    res.status(500).json({ error: 'PDF eksport xatolik' });
  }
});

router.get('/export/excel', async (req: AuthRequest, res) => {
  try {
    res.json({ message: 'Excel eksport tez orada qoshiladi' });
  } catch (error) {
    res.status(500).json({ error: 'Excel eksport xatolik' });
  }
});

export default router;

// ==================== AUDIT ENDPOINTS ====================

// Kassa tarixini olish
router.get('/history', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userId, action, limit } = req.query;
    
    const { getCashboxHistory } = await import('../utils/cashbox-audit');
    
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;
    if (limit) filters.limit = parseInt(limit as string);
    
    const history = await getCashboxHistory(filters);
    res.json(history);
  } catch (error) {
    console.error('Get cashbox history error:', error);
    res.status(500).json({ error: 'Kassa tarixini olishda xatolik' });
  }
});

// Kassa statistikasini olish
router.get('/audit-stats', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const { getCashboxAuditStats } = await import('../utils/cashbox-audit');
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const stats = await getCashboxAuditStats(start, end);
    res.json(stats);
  } catch (error) {
    console.error('Get cashbox stats error:', error);
    res.status(500).json({ error: 'Kassa statistikasini olishda xatolik' });
  }
});

// Shubhali kassa faoliyatini aniqlash
router.get('/suspicious-activity', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.query;
    
    const { detectSuspiciousActivity } = await import('../utils/cashbox-audit');
    
    const suspicious = await detectSuspiciousActivity(userId as string);
    res.json(suspicious);
  } catch (error) {
    console.error('Detect suspicious cashbox activity error:', error);
    res.status(500).json({ error: 'Shubhali faoliyatni aniqlashda xatolik' });
  }
});

// Tranzaksiya tarixini olish
router.get('/transaction-history/:entityId', async (req: AuthRequest, res) => {
  try {
    const { entityId } = req.params;
    
    const { getTransactionHistory } = await import('../utils/cashbox-audit');
    
    const history = await getTransactionHistory(entityId);
    res.json(history);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Tranzaksiya tarixini olishda xatolik' });
  }
});
