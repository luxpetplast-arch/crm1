import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Barcha kartlarni olish
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cards = await prisma.$queryRaw`
      SELECT 
        c.*,
        COUNT(cp.id) as productCount
      FROM Card c
      LEFT JOIN CardProduct cp ON c.id = cp.cardId AND cp.active = true
      WHERE c.active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Yangi kart yaratish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Kart nomini tekshirish
    const existingCard = await prisma.$queryRaw`
      SELECT id FROM Card WHERE name = ${name}
    ` as any[];

    if (existingCard.length > 0) {
      return res.status(400).json({ error: 'Card with this name already exists' });
    }

    const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRaw`
      INSERT INTO Card (id, name, description, price, active, createdAt, updatedAt)
      VALUES (${cardId}, ${name}, ${description}, ${price || 0}, true, datetime('now'), datetime('now'))
    `;

    const card = await prisma.$queryRaw`
      SELECT * FROM Card WHERE id = ${cardId}
    ` as any[];

    res.status(201).json(card[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kartni yangilash
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, active } = req.body;

    await prisma.$executeRaw`
      UPDATE Card 
      SET name = ${name}, description = ${description}, price = ${price}, active = ${active}, updatedAt = datetime('now')
      WHERE id = ${id}
    `;

    const card = await prisma.$queryRaw`
      SELECT * FROM Card WHERE id = ${id}
    ` as any[];

    res.json(card[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kartni o'chirish (deactivate)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$executeRaw`
      UPDATE Card SET active = false WHERE id = ${id}
    `;

    res.json({ message: 'Card deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kartga mahsulot qo'shish
router.post('/:id/products', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    // Mahsulot va kartni tekshirish
    const [card, product] = await Promise.all([
      prisma.$queryRaw`SELECT id FROM Card WHERE id = ${id}` as any[],
      prisma.$queryRaw`SELECT id FROM Product WHERE id = ${productId}` as any[]
    ]);

    if (card.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Avvaldan qo'shilganligini tekshirish
    const existingCardProduct = await prisma.$queryRaw`
      SELECT id FROM CardProduct WHERE cardId = ${id} AND productId = ${productId}
    ` as any[];

    if (existingCardProduct.length > 0) {
      return res.status(400).json({ error: 'Product already added to this card' });
    }

    const cardProductId = `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRaw`
      INSERT INTO CardProduct (id, cardId, productId, quantity, active, createdAt)
      VALUES (${cardProductId}, ${id}, ${productId}, ${quantity || 1}, true, datetime('now'))
    `;

    const cardProduct = await prisma.$queryRaw`
      SELECT cp.*, p.name as productName, p.pricePerBag 
      FROM CardProduct cp
      LEFT JOIN Product p ON cp.productId = p.id
      WHERE cp.id = ${cardProductId}
    ` as any[];

    res.status(201).json(cardProduct[0]);
  } catch (error) {
    console.error('Error adding product to card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kartdan mahsulotni olib tashlash
router.delete('/:id/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { id, productId } = req.params;

    await prisma.$executeRaw`
      DELETE FROM CardProduct WHERE cardId = ${id} AND productId = ${productId}
    `;

    res.json({ message: 'Product removed from card successfully' });
  } catch (error) {
    console.error('Error removing product from card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
