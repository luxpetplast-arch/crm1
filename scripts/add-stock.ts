import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStock() {
  const productId = 'ac662635-1746-4d32-8d2f-6694e474bc12';
  
  // 1000 qop (1 million dona) qo'shamiz
  const stockToAdd = 1000;
  const unitsToAdd = stockToAdd * 1000; // 1000 dona per bag
  
  console.log('Adding stock to product...');
  console.log('Product ID:', productId);
  console.log('Stock to add:', stockToAdd, 'bags');
  console.log('Units to add:', unitsToAdd, 'pieces');
  
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      currentStock: {
        increment: stockToAdd
      },
      currentUnits: {
        increment: unitsToAdd
      }
    },
    select: {
      id: true,
      name: true,
      currentStock: true,
      currentUnits: true,
      unitsPerBag: true
    }
  });
  
  console.log('Updated product:', updatedProduct);
  
  // Stock movement yaratish
  await prisma.stockMovement.create({
    data: {
      productId: productId,
      type: 'MANUAL_ADJUSTMENT',
      quantity: stockToAdd,
      units: unitsToAdd,
      previousStock: 0,
      previousUnits: 0,
      newStock: updatedProduct.currentStock,
      newUnits: updatedProduct.currentUnits,
      userId: '4fca0830-e3f1-4677-bed3-99d39edf7276', // cashier user
      userName: 'System Admin',
      reason: 'Stok to\'ldirish - test savdo uchun',
      notes: '15gr prozrach mahsulotiga 1000 qop stok qo\'shildi'
    }
  });
  
  console.log('Stock movement created successfully');
  
  await prisma.$disconnect();
}

addStock().catch(console.error);
