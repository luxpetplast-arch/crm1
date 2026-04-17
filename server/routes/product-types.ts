import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Barcha mahsulot turlarini olish
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 ProductTypes GET request received');
    
    // Avval jadval borligini tekshiramiz
    const tableCheck = await prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master WHERE type='table' AND name='ProductType'
    `;
    
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
    interface ProductTypeRaw {
      id: bigint;
      name: string;
      description: string | null;
      defaultCard: string | null;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
      productCount: bigint;
    }
    const serializedTypes = (productTypes as unknown as ProductTypeRaw[]).map((type) => ({
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

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Name must not exceed 100 characters' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }
    if (defaultCard && typeof defaultCard !== 'string') {
      return res.status(400).json({ error: 'defaultCard must be a string' });
    }

    // Sanitize input
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedDefaultCard = defaultCard ? defaultCard.trim() : null;

    // Nomni tekshirish - use Prisma ORM instead of raw SQL
    const existingType = await prisma.productType.findFirst({
      where: { name: sanitizedName }
    });

    if (existingType) {
      return res.status(400).json({ error: 'Product type with this name already exists' });
    }

    const typeId = `type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRaw`
      INSERT INTO ProductType (id, name, description, defaultCard, active, createdAt, updatedAt)
      VALUES (${typeId}, ${sanitizedName}, ${sanitizedDescription}, ${sanitizedDefaultCard}, true, datetime('now'), datetime('now'))
    `;

    const productType = await prisma.productType.findUnique({
      where: { id: typeId }
    });

    res.status(201).json(productType);
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

    // Input validation
    if (name && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
      return res.status(400).json({ error: 'Name must be a non-empty string with max 100 characters' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }
    if (defaultCard && typeof defaultCard !== 'string') {
      return res.status(400).json({ error: 'defaultCard must be a string' });
    }
    if (active !== undefined && typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    // Sanitize input
    const sanitizedName = name ? name.trim() : null;
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedDefaultCard = defaultCard ? defaultCard.trim() : null;

    await prisma.$executeRaw`
      UPDATE ProductType 
      SET name = ${sanitizedName}, description = ${sanitizedDescription}, defaultCard = ${sanitizedDefaultCard}, active = ${active}, updatedAt = datetime('now')
      WHERE id = ${id}
    `;

    const productType = await prisma.productType.findUnique({
      where: { id }
    });

    res.json(productType);
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
