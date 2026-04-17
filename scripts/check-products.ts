import { prisma } from '../server/utils/prisma';

async function checkProductStructure() {
  console.log('Checking product structure...');
  
  try {
    const types = await prisma.productType.findMany();
    console.log('Product Types:', types.map(t => ({ id: t.id, name: t.name })));
    
    const categories = await prisma.productCategory.findMany({ 
      include: { productType: true } 
    });
    console.log('Product Categories:', categories.map(c => ({ 
      id: c.id, 
      name: c.name, 
      type: c.productType?.name 
    })));
    
    const sizes = await prisma.productSize.findMany({ 
      include: { category: { include: { productType: true } } } 
    });
    console.log('Product Sizes (first 10):', sizes.slice(0, 10).map(s => ({ 
      id: s.id, 
      name: s.name, 
      value: s.value,
      unit: s.unit,
      category: s.category?.name,
      type: s.category?.productType?.name
    })));
    
  } catch (error) {
    console.error('Error checking product structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductStructure();
