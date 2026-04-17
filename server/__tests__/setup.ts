import { beforeAll, beforeEach, afterAll, jest } from '@jest/globals';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';

// Test database cleanup
beforeAll(async () => {
  // Test databaseni tozalash
  const tables = ['SaleItem', 'Sale', 'StockMovement', 'CashboxTransaction'];
  for (const table of tables) {
    await (prisma as any)[table.toLowerCase()].deleteMany().catch(() => {});
  }
  
  // Test products va customers ni o'chirish
  await prisma.product.deleteMany({
    where: { name: { startsWith: 'TEST_' } }
  });
  await prisma.customer.deleteMany({
    where: { phone: { startsWith: '+999' } }
  });
  await prisma.user.deleteMany({
    where: { email: { contains: 'test_' } }
  });
});

// Har bir testdan oldin
beforeEach(async () => {
  // Cache tozalash
  await redis.flushdb();
  jest.clearAllMocks();
});

// Hamma testlar tugagach
afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});
