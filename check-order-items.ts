import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrderItems() {
  const orders = await prisma.order.findMany({
    take: 5,
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  console.log('📋 Buyurtma tarkibini tekshirish:');
  orders.forEach((order, i) => {
    console.log(`${i+1}. Buyurtma: ${order.orderNumber}`);
    order.items?.forEach((item, j) => {
      console.log(`  ${j+1}. Mahsulot: ${item.product?.name || 'Noma\'lum'} (ID: ${item.productId})`);
      console.log(`      Miqdor: ${item.quantityBags} qop`);
    });
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkOrderItems().catch(console.error);
