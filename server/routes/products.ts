import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import {
  logInventoryAction,
  getInventoryHistory,
  getInventoryAuditStats,
  getProductHistory,
  detectSuspiciousInventoryActivity,
  getStockBalanceHistory,
} from '../utils/inventory-audit';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { lowStock, search } = req.query;
    
    // Kam qolgan mahsulotlar filtri
    if (lowStock === 'true') {
      const allProducts = await prisma.product.findMany({
        include: { batches: { orderBy: { productionDate: 'desc' }, take: 1 } },
      });
      
      const lowStockProducts = allProducts.filter(p => p.currentStock < p.minStockLimit);
      return res.json(lowStockProducts);
    }
    
    // Qidirish - SQLite uchun case-insensitive qidirish
    if (search) {
      const allProducts = await prisma.product.findMany({
        include: { batches: { orderBy: { productionDate: 'desc' }, take: 1 } },
      });
      
      const searchLower = (search as string).toLowerCase();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.bagType.toLowerCase().includes(searchLower)
      );
      return res.json(filtered);
    }
    
    const products = await prisma.product.findMany({
      include: { batches: { orderBy: { productionDate: 'desc' }, take: 1 } },
    });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    console.log('Creating product with data:', req.body);
    const product = await prisma.product.create({ data: req.body });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: 'MAHSULOT_YARATISH',
      entity: 'INVENTORY',
      entityId: product.id,
      productId: product.id,
      productName: product.name,
      details: {
        type: 'ADD',
        notes: 'Yangi mahsulot yaratildi',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const oldProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: 'MAHSULOT_TAHRIRLASH',
      entity: 'INVENTORY',
      entityId: product.id,
      productId: product.id,
      productName: product.name,
      details: {
        type: 'EDIT',
        oldValue: oldProduct,
        newValue: product,
        notes: 'Mahsulot ma\'lumotlari tahrirlandi',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Stock update endpoint
router.post('/:id/stock', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { quantity, type, reason, notes } = req.body;
    const productId = req.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = product.currentStock;
    const previousUnits = product.currentUnits;
    let newStock = previousStock;
    let newUnits = previousUnits;

    if (type === 'ADD') {
      newStock = previousStock + quantity;
      newUnits = previousUnits + (quantity * product.unitsPerBag);
    } else if (type === 'REMOVE') {
      newStock = previousStock - quantity;
      newUnits = previousUnits - (quantity * product.unitsPerBag);
    } else if (type === 'ADJUST') {
      newStock = quantity;
      newUnits = quantity * product.unitsPerBag;
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
        currentUnits: newUnits,
      },
    });

    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        productId,
        type: type || 'ADJUST',
        quantity,
        units: quantity * product.unitsPerBag,
        reason: reason || `Ombor ${type === 'ADD' ? 'qo\'shildi' : type === 'REMOVE' ? 'kamaytirildi' : 'sozlandi'}`,
        userId: req.user!.id,
        userName: (req.user as any).name || req.user!.email,
        previousStock,
        previousUnits,
        newStock,
        newUnits,
        notes: notes || '',
      },
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: type === 'ADD' ? 'OMBOR_QOSHISH' : type === 'REMOVE' ? 'OMBOR_KAMAYTIRISH' : 'OMBOR_SOZLASH',
      entity: 'INVENTORY',
      entityId: productId,
      productId,
      productName: product.name,
      details: {
        type,
        quantity,
        reason,
        previousStock,
        newStock,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

router.post('/:id/batch', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { quantity, productionDate, shift, responsiblePerson } = req.body;
    
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const batch = await prisma.batch.create({
      data: {
        productId: req.params.id,
        quantity,
        productionDate: new Date(productionDate),
        shift,
        responsiblePerson,
      },
    });

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { currentStock: { increment: quantity } },
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: 'PARTIYA_QOSHISH',
      entity: 'INVENTORY',
      entityId: batch.id,
      productId: product.id,
      productName: product.name,
      details: {
        type: 'PRODUCTION',
        quantityBags: quantity,
        previousStock: product.currentStock,
        newStock: updatedProduct.currentStock,
        batchId: batch.id,
        shift,
        responsiblePerson,
        notes: `Yangi partiya qo'shildi - ${shift} smena`,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add batch' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const alerts = products.map(p => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.currentStock,
      status: p.currentStock === 0 ? 'critical' : 
              p.currentStock < p.minStockLimit ? 'danger' :
              p.currentStock < p.optimalStock ? 'warning' : 'ok',
    })).filter(a => a.status !== 'ok');
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        batches: { orderBy: { productionDate: 'desc' }, take: 10 },
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

router.post('/:id/adjust-units', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { units, type, reason, notes } = req.body;
    const productId = req.params.id;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const unitsChange = type === 'ADD' ? units : -units;
    const newUnits = product.currentUnits + unitsChange;
    
    if (newUnits < 0) {
      return res.status(400).json({ error: 'Dona soni manfiy bo\'lishi mumkin emas' });
    }
    
    const newBags = Math.floor(newUnits / product.unitsPerBag);
    const remainingUnits = newUnits % product.unitsPerBag;
    
    // Auto-generate reason if not provided
    const autoReason = type === 'ADD' ? 'Dona qo\'shildi' : 'Dona kamaytirildi';
    
    await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity: newBags - product.currentStock,
        units: unitsChange,
        reason: reason || autoReason,
        userId: req.user!.id,
        userName: (req.user as any).name || req.user!.email,
        previousStock: product.currentStock,
        previousUnits: product.currentUnits,
        newStock: newBags,
        newUnits,
        notes: notes || null,
      },
    });
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: newBags,
        currentUnits: newUnits,
      },
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: type === 'ADD' ? 'DONA_QOSHISH' : 'DONA_KAMAYTIRISH',
      entity: 'INVENTORY',
      entityId: productId,
      productId,
      productName: product.name,
      details: {
        type: type === 'ADD' ? 'ADD' : 'REMOVE',
        quantityUnits: Math.abs(unitsChange),
        quantityBags: newBags - product.currentStock,
        previousStock: product.currentStock,
        previousUnits: product.currentUnits,
        newStock: newBags,
        newUnits,
        reason: reason || autoReason,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      success: true,
      product: updatedProduct,
      change: {
        units: unitsChange,
        bags: newBags - product.currentStock,
        remainingUnits,
      },
    });
  } catch (error) {
    console.error('Adjust units error:', error);
    res.status(500).json({ error: 'Failed to adjust units' });
  }
});

router.post('/:id/adjust-bags', authorize('ADMIN', 'WAREHOUSE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { bags, type, reason, notes } = req.body;
    const productId = req.params.id;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const bagsChange = type === 'ADD' ? bags : -bags;
    const newBags = product.currentStock + bagsChange;
    
    if (newBags < 0) {
      return res.status(400).json({ error: 'Qop soni manfiy bo\'lishi mumkin emas' });
    }
    
    const unitsChange = bagsChange * product.unitsPerBag;
    const newUnits = product.currentUnits + unitsChange;
    
    // Auto-generate reason if not provided
    const autoReason = type === 'ADD' ? 'Qop qo\'shildi' : 'Qop kamaytirildi';
    
    await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity: bagsChange,
        units: unitsChange,
        reason: reason || autoReason,
        userId: req.user!.id,
        userName: (req.user as any).name || req.user!.email,
        previousStock: product.currentStock,
        previousUnits: product.currentUnits,
        newStock: newBags,
        newUnits,
        notes: notes || null,
      },
    });
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: newBags,
        currentUnits: newUnits,
      },
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: type === 'ADD' ? 'QOP_QOSHISH' : 'QOP_KAMAYTIRISH',
      entity: 'INVENTORY',
      entityId: productId,
      productId,
      productName: product.name,
      details: {
        type: type === 'ADD' ? 'ADD' : 'REMOVE',
        quantityBags: Math.abs(bagsChange),
        quantityUnits: Math.abs(unitsChange),
        previousStock: product.currentStock,
        previousUnits: product.currentUnits,
        newStock: newBags,
        newUnits,
        reason: reason || autoReason,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      success: true,
      product: updatedProduct,
      change: {
        bags: bagsChange,
        units: unitsChange,
      },
    });
  } catch (error) {
    console.error('Adjust bags error:', error);
    res.status(500).json({ error: 'Failed to adjust bags' });
  }
});

router.get('/:id/movements', async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// TARIX ENDPOINTLARI

// Ombor tarixini olish
router.get('/audit/history', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userId, productId, action, limit } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (userId) filters.userId = userId as string;
    if (productId) filters.productId = productId as string;
    if (action) filters.action = action as string;
    if (limit) filters.limit = parseInt(limit as string);

    const history = await getInventoryHistory(filters);

    // Ko'rish harakatini log qilish
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: 'OMBOR_TARIX_KORISH',
      entity: 'INVENTORY',
      entityId: 'history-view',
      details: {
        type: 'VIEW',
        notes: 'Ombor tarixini ko\'rdi',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(history);
  } catch (error) {
    console.error('Get inventory history error:', error);
    res.status(500).json({ error: 'Tarixni yuklashda xatolik' });
  }
});

// Ombor statistikasini olish
router.get('/audit/stats', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await getInventoryAuditStats(start, end);

    res.json(stats);
  } catch (error) {
    console.error('Get inventory audit stats error:', error);
    res.status(500).json({ error: 'Statistikani yuklashda xatolik' });
  }
});

// Mahsulot tarixini olish
router.get('/:id/history', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const history = await getProductHistory(id);

    res.json(history);
  } catch (error) {
    console.error('Get product history error:', error);
    res.status(500).json({ error: 'Mahsulot tarixini yuklashda xatolik' });
  }
});

// Shubhali faoliyatni aniqlash
router.get('/audit/suspicious-activity', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.query;
    const suspicious = await detectSuspiciousInventoryActivity(userId as string | undefined);

    res.json(suspicious);
  } catch (error) {
    console.error('Detect suspicious activity error:', error);
    res.status(500).json({ error: 'Shubhali faoliyatni aniqlashda xatolik' });
  }
});

// Mahsulot balans tarixini olish
router.get('/:id/balance-history', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { days } = req.query;
    
    const daysNum = days ? parseInt(days as string) : 30;
    const history = await getStockBalanceHistory(id, daysNum);

    res.json(history);
  } catch (error) {
    console.error('Get balance history error:', error);
    res.status(500).json({ error: 'Balans tarixini yuklashda xatolik' });
  }
});

// KIRIM VA CHIQIM TARIXLARI

// Kirim tarixi (Ishlab chiqarish, Tuzatish +)
router.get('/history/income', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, productId, userId, limit } = req.query;

    const where: any = {
      type: { in: ['PRODUCTION', 'ADJUST'] },
      quantity: { gt: 0 }
    };
    
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });

    const totalBags = movements.reduce((sum, m) => sum + m.quantity, 0);
    const totalUnits = movements.reduce((sum, m) => sum + m.units, 0);

    res.json({
      movements,
      total: {
        bags: totalBags,
        units: totalUnits,
        count: movements.length
      }
    });
  } catch (error) {
    console.error('Get income history error:', error);
    res.status(500).json({ error: 'Kirim tarixini yuklashda xatolik' });
  }
});

// Chiqim tarixi (Sotuv, Tuzatish -)
router.get('/history/expense', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, productId, userId, limit } = req.query;

    const where: any = {
      OR: [
        { type: 'SALE' },
        { type: 'ADJUST', quantity: { lt: 0 } }
      ]
    };
    
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });

    const totalBags = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const totalUnits = movements.reduce((sum, m) => sum + Math.abs(m.units), 0);

    res.json({
      movements,
      total: {
        bags: totalBags,
        units: totalUnits,
        count: movements.length
      }
    });
  } catch (error) {
    console.error('Get expense history error:', error);
    res.status(500).json({ error: 'Chiqim tarixini yuklashda xatolik' });
  }
});

// Ombor statistikasi (kirim/chiqim)
router.get('/history/stats', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, productId } = req.query;

    const where: any = {};
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    if (productId) where.productId = productId;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' },
    });

    // Kirim (PRODUCTION, ADJUST +)
    const income = movements.filter(m => 
      (m.type === 'PRODUCTION' || m.type === 'ADJUST') && m.quantity > 0
    );
    const totalIncomeBags = income.reduce((sum, m) => sum + m.quantity, 0);
    const totalIncomeUnits = income.reduce((sum, m) => sum + m.units, 0);

    // Chiqim (SALE, ADJUST -)
    const expense = movements.filter(m => 
      m.type === 'SALE' || (m.type === 'ADJUST' && m.quantity < 0)
    );
    const totalExpenseBags = expense.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const totalExpenseUnits = expense.reduce((sum, m) => sum + Math.abs(m.units), 0);

    // Mahsulot bo'yicha
    const byProduct: any = {};
    movements.forEach(m => {
      if (!byProduct[m.productId]) {
        byProduct[m.productId] = {
          productName: m.product.name,
          income: { bags: 0, units: 0 },
          expense: { bags: 0, units: 0 },
          count: 0
        };
      }
      
      if ((m.type === 'PRODUCTION' || m.type === 'ADJUST') && m.quantity > 0) {
        byProduct[m.productId].income.bags += m.quantity;
        byProduct[m.productId].income.units += m.units;
      } else if (m.type === 'SALE' || (m.type === 'ADJUST' && m.quantity < 0)) {
        byProduct[m.productId].expense.bags += Math.abs(m.quantity);
        byProduct[m.productId].expense.units += Math.abs(m.units);
      }
      
      byProduct[m.productId].count++;
    });

    // Foydalanuvchi bo'yicha
    const byUser: any = {};
    movements.forEach(m => {
      if (!byUser[m.userId]) {
        byUser[m.userId] = {
          userName: m.userName,
          income: { bags: 0, units: 0 },
          expense: { bags: 0, units: 0 },
          count: 0
        };
      }
      
      if ((m.type === 'PRODUCTION' || m.type === 'ADJUST') && m.quantity > 0) {
        byUser[m.userId].income.bags += m.quantity;
        byUser[m.userId].income.units += m.units;
      } else if (m.type === 'SALE' || (m.type === 'ADJUST' && m.quantity < 0)) {
        byUser[m.userId].expense.bags += Math.abs(m.quantity);
        byUser[m.userId].expense.units += Math.abs(m.units);
      }
      
      byUser[m.userId].count++;
    });

    // Kunlik statistika
    const dailyStats: any = {};
    movements.forEach(m => {
      const date = new Date(m.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          income: { bags: 0, units: 0 },
          expense: { bags: 0, units: 0 },
          count: 0
        };
      }
      
      if ((m.type === 'PRODUCTION' || m.type === 'ADJUST') && m.quantity > 0) {
        dailyStats[date].income.bags += m.quantity;
        dailyStats[date].income.units += m.units;
      } else if (m.type === 'SALE' || (m.type === 'ADJUST' && m.quantity < 0)) {
        dailyStats[date].expense.bags += Math.abs(m.quantity);
        dailyStats[date].expense.units += Math.abs(m.units);
      }
      
      dailyStats[date].count++;
    });

    res.json({
      total: {
        income: {
          bags: totalIncomeBags,
          units: totalIncomeUnits,
          count: income.length
        },
        expense: {
          bags: totalExpenseBags,
          units: totalExpenseUnits,
          count: expense.length
        },
        net: {
          bags: totalIncomeBags - totalExpenseBags,
          units: totalIncomeUnits - totalExpenseUnits
        }
      },
      byProduct: Object.values(byProduct),
      byUser: Object.values(byUser),
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      }))
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ error: 'Statistikani yuklashda xatolik' });
  }
});

// Mahsulot kirim tarixi
router.get('/:id/income', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit } = req.query;

    const where: any = {
      productId: id,
      type: { in: ['PRODUCTION', 'ADJUST'] },
      quantity: { gt: 0 }
    };
    
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });

    const totalBags = movements.reduce((sum, m) => sum + m.quantity, 0);
    const totalUnits = movements.reduce((sum, m) => sum + m.units, 0);

    res.json({
      movements,
      total: {
        bags: totalBags,
        units: totalUnits,
        count: movements.length
      }
    });
  } catch (error) {
    console.error('Get product income error:', error);
    res.status(500).json({ error: 'Mahsulot kirim tarixini yuklashda xatolik' });
  }
});

// Mahsulot chiqim tarixi
router.get('/:id/expense', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit } = req.query;

    const where: any = {
      productId: id,
      OR: [
        { type: 'SALE' },
        { type: 'ADJUST', quantity: { lt: 0 } }
      ]
    };
    
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });

    const totalBags = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const totalUnits = movements.reduce((sum, m) => sum + Math.abs(m.units), 0);

    res.json({
      movements,
      total: {
        bags: totalBags,
        units: totalUnits,
        count: movements.length
      }
    });
  } catch (error) {
    console.error('Get product expense error:', error);
    res.status(500).json({ error: 'Mahsulot chiqim tarixini yuklashda xatolik' });
  }
});

// DELETE /products/:id - Mahsulotni o'chirish
router.delete('/:id', authorize('ADMIN', 'WAREHOUSE_MANAGER', 'MANAGER', 'USER'), async (req: AuthRequest, res) => {
  try {
    console.log('Delete product request:', {
      productId: req.params.id,
      userRole: req.user?.role,
      userId: req.user?.id
    });

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Bog'liq ma'lumotlarni tekshirish
    const relatedData = await prisma.$transaction([
      // Order items
      prisma.orderItem.count({ where: { productId: req.params.id } }),
      // Production batches
      prisma.batch.count({ where: { productId: req.params.id } }),
      // Stock movements
      prisma.stockMovement.count({ where: { productId: req.params.id } }),
      // Stock alerts
      prisma.stockAlert.count({ where: { productId: req.params.id } }),
      // Sales forecasts
      prisma.salesForecast.count({ where: { productId: req.params.id } }),
      // Price levels
      prisma.priceLevel.count({ where: { productId: req.params.id } }),
      // Production orders
      prisma.productionOrder.count({ where: { productId: req.params.id } }),
      // Quality checks
      prisma.qualityCheck.count({ where: { productId: req.params.id } }),
      // Sales with this product
      prisma.sale.count({ where: { productId: req.params.id } }),
      // Sale items
      prisma.saleItem.count({ where: { productId: req.params.id } })
    ]);

    const [orderItemsCount, batchesCount, movementsCount, alertsCount, 
          forecastsCount, priceLevelsCount, productionOrdersCount, 
          qualityChecksCount, salesCount, saleItemsCount] = relatedData;

    console.log('Related data check:', {
      orderItemsCount,
      batchesCount,
      movementsCount,
      alertsCount,
      forecastsCount,
      priceLevelsCount,
      productionOrdersCount,
      qualityChecksCount,
      salesCount,
      saleItemsCount
    });

    // Agar bog'liq ma'lumotlar bo'lsa, ularni o'chirish
    if (orderItemsCount > 0 || batchesCount > 0 || movementsCount > 0 || alertsCount > 0 ||
        forecastsCount > 0 || priceLevelsCount > 0 || productionOrdersCount > 0 || 
        qualityChecksCount > 0 || salesCount > 0 || saleItemsCount > 0) {
      console.log('Cleaning up related data before deleting product...');
      
      await prisma.$transaction([
        // Order items larni o'chirish
        ...(orderItemsCount > 0 ? [prisma.orderItem.deleteMany({ where: { productId: req.params.id } })] : []),
        // Production batches larni o'chirish
        ...(batchesCount > 0 ? [prisma.batch.deleteMany({ where: { productId: req.params.id } })] : []),
        // Stock movements larni o'chirish
        ...(movementsCount > 0 ? [prisma.stockMovement.deleteMany({ where: { productId: req.params.id } })] : []),
        // Stock alerts larni o'chirish
        ...(alertsCount > 0 ? [prisma.stockAlert.deleteMany({ where: { productId: req.params.id } })] : []),
        // Sales forecasts larni o'chirish
        ...(forecastsCount > 0 ? [prisma.salesForecast.deleteMany({ where: { productId: req.params.id } })] : []),
        // Price levels larni o'chirish
        ...(priceLevelsCount > 0 ? [prisma.priceLevel.deleteMany({ where: { productId: req.params.id } })] : []),
        // Production orders larni o'chirish
        ...(productionOrdersCount > 0 ? [prisma.productionOrder.deleteMany({ where: { productId: req.params.id } })] : []),
        // Quality checks larni o'chirish
        ...(qualityChecksCount > 0 ? [prisma.qualityCheck.deleteMany({ where: { productId: req.params.id } })] : []),
        // Sales larni o'chirish
        ...(salesCount > 0 ? [prisma.sale.deleteMany({ where: { productId: req.params.id } })] : []),
        // Sale items larni o'chirish
        ...(saleItemsCount > 0 ? [prisma.saleItem.deleteMany({ where: { productId: req.params.id } })] : [])
      ]);
      
      console.log('Related data cleaned successfully');
    }

    // Endi mahsulotni o'chirish
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    // Audit log
    await logInventoryAction({
      userId: req.user!.id,
      userName: (req.user as any).name || req.user!.email,
      action: 'MAHSULOT_OCHIRISH',
      entity: 'INVENTORY',
      entityId: req.params.id,
      productId: req.params.id,
      productName: product.name,
      details: {
        type: 'DELETE',
        notes: 'Mahsulot o\'chirildi',
        newValue: {
          orderItemsCount,
          batchesCount,
          movementsCount,
          alertsCount,
          forecastsCount,
          priceLevelsCount,
          productionOrdersCount,
          qualityChecksCount,
          salesCount,
          saleItemsCount
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    console.log('Product deleted successfully:', product.name);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

