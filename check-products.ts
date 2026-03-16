import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  const products = await prisma.product.findMany();
  console.log('📦 Mahsulotlar holati:');
  products.forEach((product, i) => {
    console.log(`${i + 1}. ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Qoplar: ${product.currentStock}`);
    console.log(`   Donalar: ${product.currentUnits}`);
    console.log(`   Narx: ${product.pricePerBag}`);
    console.log(`   Status: ${product.currentStock > 0 ? '✅' : '❌'}`);
    console.log('');
  });
  await prisma.$disconnect();
}

checkProducts().catch(console.error);
