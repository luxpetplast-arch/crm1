import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStock() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: '15gr prozrach' } },
    select: { 
      id: true, 
      name: true, 
      currentStock: true, 
      currentUnits: true, 
      unitsPerBag: true,
      warehouse: true 
    }
  });
  
  console.log('Product:', product);
  
  await prisma.$disconnect();
}

checkStock().catch(console.error);
