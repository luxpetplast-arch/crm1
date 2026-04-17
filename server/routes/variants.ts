import express, { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all variants for a parent product
router.get('/parent/:parentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { parentId } = req.params;
    
    const variants = await prisma.productVariant.findMany({
      where: { parentId },
      orderBy: { variantName: 'asc' }
    });
    
    res.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
});

// Get all variants for a product
router.get('/products/:productId/variants', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const variants = await prisma.productVariant.findMany({
      where: { parentId: productId },
      orderBy: { variantName: 'asc' }
    });
    
    res.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
});

// Get single variant with details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            bagType: true,
            unitsPerBag: true
          }
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    // Calculate sales stats
    const salesStats = await prisma.saleItem.aggregate({
      where: { variantId: id },
      _sum: {
        quantity: true,
        subtotal: true
      },
      _count: true
    });
    
    res.json({
      ...variant,
      salesStats: {
        totalSold: salesStats._sum.quantity || 0,
        totalRevenue: salesStats._sum.subtotal || 0,
        salesCount: salesStats._count
      }
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    res.status(500).json({ error: 'Failed to fetch variant' });
  }
});

// Create variant
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { parentProductId, variantName, pricePerBag, initialStock, minStockLimit, optimalStock, maxCapacity, productionCost } = req.body;
    
    // Validate parent exists and is a parent product
    const parent = await prisma.product.findUnique({
      where: { id: parentProductId }
    });
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent product not found' });
    }
    
    if (!parent.isParent) {
      return res.status(400).json({ error: 'Product is not a parent product' });
    }
    
    // Create variant as a product
    const variant = await prisma.product.create({
      data: {
        name: `${parent.name} - ${variantName}`,
        bagType: parent.bagType,
        unitsPerBag: parent.unitsPerBag,
        currentStock: initialStock || 0,
        pricePerBag,
        minStockLimit: minStockLimit || parent.minStockLimit,
        optimalStock: optimalStock || parent.optimalStock,
        maxCapacity: maxCapacity || parent.maxCapacity,
        productionCost: productionCost || parent.productionCost,
        isParent: false,
        parent: { connect: { id: parentProductId } },
        variantName,
        active: true
      }
    });
    
    // Create initial stock movement if stock > 0
    if (initialStock && initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: variant.id,
          type: 'ADD',
          quantity: initialStock,
          units: initialStock * parent.unitsPerBag,
          reason: 'Initial stock',
          userId: req.user?.id || 'system',
          userName: req.user?.name || 'System',
          previousStock: 0,
          previousUnits: 0,
          newStock: initialStock,
          newUnits: initialStock * parent.unitsPerBag,
          notes: 'Variant created with initial stock'
        }
      });
    }
    
    res.status(201).json(variant);
  } catch (error) {
    console.error('Error creating variant:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// Create variant (old endpoint for compatibility)
router.post('/products/:productId/variants', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    const { variantName, currentStock, pricePerBag, sku } = req.body;
    
    // Validate parent exists and is a parent product
    const parent = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent product not found' });
    }
    
    if (!parent.isParent) {
      return res.status(400).json({ error: 'Product is not a parent product' });
    }
    
    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        parentId: productId,
        variantName,
        currentStock: currentStock || 0,
        currentUnits: (currentStock || 0) * parent.unitsPerBag,
        pricePerBag,
        sku,
        active: true
      }
    });
    
    // Create initial stock movement if stock > 0
    if (currentStock > 0) {
      await prisma.variantStockMovement.create({
        data: {
          variantId: variant.id,
          type: 'ADD',
          quantity: currentStock,
          units: currentStock * parent.unitsPerBag,
          reason: 'Initial stock',
          userId: req.user?.id || 'system',
          userName: req.user?.name || 'System',
          previousStock: 0,
          previousUnits: 0,
          newStock: currentStock,
          newUnits: currentStock * parent.unitsPerBag,
          notes: 'Variant created with initial stock'
        }
      });
    }
    
    res.status(201).json(variant);
  } catch (error) {
    console.error('Error creating variant:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// Update variant
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { variantName, active } = req.body;
    
    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(variantName && { variantName }),
        ...(active !== undefined && { active })
      }
    });
    
    res.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ error: 'Failed to update variant' });
  }
});

// Adjust variant stock
router.post('/:id/stock', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, notes } = req.body;
    
    if (!['ADD', 'REMOVE', 'ADJUST'].includes(type)) {
      return res.status(400).json({ error: 'Invalid stock movement type' });
    }
    
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { parent: true }
    });
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const previousStock = variant.currentStock;
    const previousUnits = variant.currentUnits;
    
    let newStock = previousStock;
    if (type === 'ADD') {
      newStock = previousStock + quantity;
    } else if (type === 'REMOVE') {
      newStock = Math.max(0, previousStock - quantity);
    } else if (type === 'ADJUST') {
      newStock = quantity;
    }
    
    const newUnits = newStock * variant.parent.unitsPerBag;
    
    // Update variant stock
    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: {
        currentStock: newStock,
        currentUnits: newUnits
      }
    });
    
    // Create stock movement record
    await prisma.variantStockMovement.create({
      data: {
        variantId: id,
        type,
        quantity: Math.abs(newStock - previousStock),
        units: Math.abs(newUnits - previousUnits),
        reason,
        userId: req.user?.id || 'system',
        userName: req.user?.name || 'System',
        previousStock,
        previousUnits,
        newStock,
        newUnits,
        notes
      }
    });
    
    res.json(updatedVariant);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

// Update variant price
router.post('/:id/price', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { newPrice, reason } = req.body;
    
    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    
    const variant = await prisma.productVariant.findUnique({
      where: { id }
    });
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const oldPrice = variant.pricePerBag;
    
    // Update price
    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: { pricePerBag: newPrice }
    });
    
    // Create price history record
    await prisma.variantPriceHistory.create({
      data: {
        variantId: id,
        oldPrice,
        newPrice,
        reason,
        userId: req.user!.id,
        userName: req.user?.name || 'System',
      }
    });
    
    res.json(updatedVariant);
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// Bulk update prices for all variants of a parent
router.post('/products/:productId/variants/bulk-price', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    const { adjustment, type, increase } = req.body;
    
    if (!adjustment || !type || increase === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const variants = await prisma.productVariant.findMany({
      where: { parentId: productId, active: true }
    });
    
    const updates = [];
    
    for (const variant of variants) {
      const oldPrice = variant.pricePerBag;
      let newPrice = oldPrice;
      
      if (type === 'fixed') {
        newPrice = increase ? oldPrice + adjustment : oldPrice - adjustment;
      } else if (type === 'percent') {
        newPrice = increase 
          ? oldPrice * (1 + adjustment / 100)
          : oldPrice * (1 - adjustment / 100);
      }
      
      newPrice = Math.max(0, newPrice);
      
      // Update variant
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { pricePerBag: newPrice }
      });
      
      // Create price history
      await prisma.variantPriceHistory.create({
        data: {
          variantId: variant.id,
          oldPrice,
          newPrice,
          reason: `Bulk price adjustment: ${type} ${increase ? '+' : '-'}${adjustment}${type === 'percent' ? '%' : ''}`,
          userId: req.user!.id,
          userName: req.user?.name || 'System',
        }
      });
      
      updates.push({ variantId: variant.id, oldPrice, newPrice });
    }
    
    res.json({ success: true, updates });
  } catch (error) {
    console.error('Error bulk updating prices:', error);
    res.status(500).json({ error: 'Failed to bulk update prices' });
  }
});

// Delete variant
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if variant has sales
    const salesCount = await prisma.saleItem.count({
      where: { variantId: id }
    });
    
    if (salesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete variant with existing sales. Consider deactivating instead.' 
      });
    }
    
    await prisma.productVariant.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
});

export default router;
