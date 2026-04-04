import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Barcha mahsulot turlarini olish
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 ProductTypes GET request received');
    
    // Avval jadval borligini tekshiramiz
    const tableCheck = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='ProductType'
    ` as any[];
    
    console.log('📋 ProductType table exists:', tableCheck.length > 0);
    
    if (tableCheck.length === 0) {
      console.log('❌ ProductType jadvali mavjud emas!');
      return res.status(500).json({ error: 'ProductType table not found' });
    }

    const productTypes = await prisma.$queryRaw`
      SELECT 
        pt.id,
        pt.name,
        pt.description,
        pt.defaultCard,
        pt.active,
        pt.createdAt,
        pt.updatedAt,
        COUNT(p.id) as productCount
      FROM ProductType pt
      LEFT JOIN Product p ON pt.id = p.productTypeId
      WHERE pt.active = true
      GROUP BY pt.id
      ORDER BY pt.name ASC
    `;

    // BigInt larni string ga o'tkazish
    const serializedTypes = (productTypes as any[]).map((type: any) => ({
      ...type,
      id: String(type.id),
      productCount: Number(type.productCount)
    }));

    console.log('✅ ProductTypes loaded:', serializedTypes.length);
    res.json(serializedTypes);
  } catch (error) {
    console.error('❌ Error fetching product types:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});

// Yangi mahsulot turi yaratish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, defaultCard } = req.body;

    // Nomni tekshirish
    const existingType = await prisma.$queryRaw`
      SELECT id FROM ProductType WHERE name = ${name}
    ` as any[];

    if (existingType.length > 0) {
      return res.status(400).json({ error: 'Product type with this name already exists' });
    }

    const typeId = `type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRaw`
      INSERT INTO ProductType (id, name, description, defaultCard, active, createdAt, updatedAt)
      VALUES (${typeId}, ${name}, ${description}, ${defaultCard}, true, datetime('now'), datetime('now'))
    `;

    const productType = await prisma.$queryRaw`
      SELECT * FROM ProductType WHERE id = ${typeId}
    ` as any[];

    res.status(201).json(productType[0]);
  } catch (error) {
    console.error('Error creating product type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mahsulot turini yangilash
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, defaultCard, active } = req.body;

    await prisma.$executeRaw`
      UPDATE ProductType 
      SET name = ${name}, description = ${description}, defaultCard = ${defaultCard}, active = ${active}, updatedAt = datetime('now')
      WHERE id = ${id}
    `;

    const productType = await prisma.$queryRaw`
      SELECT * FROM ProductType WHERE id = ${id}
    ` as any[];

    res.json(productType[0]);
  } catch (error) {
    console.error('Error updating product type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mahsulot turini o'chirish (deactivate)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$executeRaw`
      UPDATE ProductType SET active = false WHERE id = ${id}
    `;

    res.json({ message: 'Product type deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating product type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
