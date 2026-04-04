const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteParents() {
  const result = await prisma.product.deleteMany({
    where: { isParent: true }
  });
  console.log('Deleted parent products:', result.count);
  await prisma.$disconnect();
}

deleteParents();
