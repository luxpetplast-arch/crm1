import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Barcha kategoriyalarni olish
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        productType: true,
        sizes: {
          where: { active: true },
          orderBy: { value: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      },
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Kategoriya bo'yicha o'lchamlar
router.get('/:categoryId/sizes', async (req, res) => {
  try {
    const sizes = await prisma.productSize.findMany({
      where: { 
        categoryId: req.params.categoryId,
        active: true 
      },
      orderBy: { value: 'asc' }
    });
    
    res.json(sizes);
  } catch (error) {
    console.error('❌ Get sizes error:', error);
    res.status(500).json({ error: 'Failed to fetch sizes' });
  }
});

// Kategoriya va o'lcham bo'yicha mahsulotlar
router.get('/:categoryId/sizes/:sizeId/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: req.params.categoryId,
        sizeId: req.params.sizeId,
        active: true
      },
      include: {
        category: true,
        size: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error('❌ Get products by category and size error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Sub-turlarni olish (gidro, karbonat, h.k.)
router.get('/sub-types', async (req, res) => {
  try {
    const subTypes = await prisma.product.findMany({
      where: {
        subType: { not: null },
        active: true
      },
      select: {
        subType: true,
        categoryId: true,
        sizeId: true
      },
      distinct: ['subType']
    });
    
    const uniqueSubTypes = [...new Set(subTypes.map(p => p.subType).filter(Boolean))];
    res.json(uniqueSubTypes);
  } catch (error) {
    console.error('❌ Get sub-types error:', error);
    res.status(500).json({ error: 'Failed to fetch sub-types' });
  }
});

export default router;
