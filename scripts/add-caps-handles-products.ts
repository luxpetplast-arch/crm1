import { prisma } from '../server/utils/prisma';

async function addCapsAndHandlesProducts() {
  console.log('Adding caps and handles products...');
  
  try {
    // First, let's check existing product types and categories
    const productTypes = await prisma.productType.findMany();
    const productCategories = await prisma.productCategory.findMany();
    const productSizes = await prisma.productSize.findMany();
    
    console.log('Existing product types:', productTypes.map(t => t.name));
    console.log('Existing product categories:', productCategories.map(c => c.name));
    console.log('Existing product sizes:', productSizes.map(s => s.name));
    
    // Find or create necessary types, categories, and sizes
    let capsType = productTypes.find(t => t.name === 'Qopqoq');
    let handlesType = productTypes.find(t => t.name === 'Ruchka');
    let dkmCategory = productCategories.find(c => c.name === 'DKM');
    let standardCategory = productCategories.find(c => c.name === 'Standard');
    
    // Create types if they don't exist
    if (!capsType) {
      capsType = await prisma.productType.create({
        data: { name: 'Qopqoq' }
      });
      console.log('Created Qopqoq type');
    }
    
    if (!handlesType) {
      handlesType = await prisma.productType.create({
        data: { name: 'Ruchka' }
      });
      console.log('Created Ruchka type');
    }
    
    if (!dkmCategory) {
      dkmCategory = await prisma.productCategory.create({
        data: { 
          name: 'DKM',
          productTypeId: capsType.id
        }
      });
      console.log('Created DKM category');
    }
    
    if (!standardCategory) {
      standardCategory = await prisma.productCategory.create({
        data: { 
          name: 'Standard',
          productTypeId: capsType.id
        }
      });
      console.log('Created Standard category');
    }
    
    // Create sizes if they don't exist
    const sizes = ['28mm', '38mm', '48mm', '55mm'];
    const createdSizes = {};
    
    for (const sizeName of sizes) {
      let size = productSizes.find(s => s.name === sizeName);
      if (!size) {
        size = await prisma.productSize.create({
          data: { name: sizeName }
        });
        console.log(`Created ${sizeName} size`);
      }
      createdSizes[sizeName] = size;
    }
    
    // 28mm Products
    console.log('\n=== Creating 28mm Products ===');
    
    // 28mm Caps - Standard (6000 dona)
    const caps28mm = [
      { name: 'Qopqoq 28 Ko\'k gaz', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Havo rang (Galuboy) gaz', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Sariq gaz', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Yashil gaz', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Qizil gaz', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Oq', category: standardCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 Qora gaz', category: standardCategory.id, stock: 6000 }
    ];
    
    // 28mm Caps - DKM
    const caps28mmDkm = [
      { name: 'Qopqoq 28 DKM Sariq', category: dkmCategory.id, stock: 4000 },
      { name: 'Qopqoq 28 DKM Ko\'k', category: dkmCategory.id, stock: 10000 },
      { name: 'Qopqoq 28 DKM Ko\'k (2)', category: dkmCategory.id, stock: 6000 },
      { name: 'Qopqoq 28 DKM Yashil', category: dkmCategory.id, stock: 4000 }
    ];
    
    // 28mm Handles
    const handles28mm = [
      { name: 'Ruchka 28 Sariq', category: standardCategory.id, stock: 1500 },
      { name: 'Ruchka 28 Sariq (2)', category: standardCategory.id, stock: 2500 }
    ];
    
    // Create 28mm products
    for (const product of [...caps28mm, ...caps28mmDkm]) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            typeId: capsType.id,
            categoryId: product.category,
            sizeId: createdSizes['28mm'].id,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: 1000, // Default price
            unitsPerBag: product.stock
          }
        });
        
        // Create stock movement
        await prisma.stockMovement.create({
          data: {
            productId: newProduct.id,
            type: 'IN',
            quantity: product.stock,
            units: product.stock,
            notes: 'Initial stock'
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    for (const product of handles28mm) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            typeId: handlesType.id,
            categoryId: product.category,
            sizeId: createdSizes['28mm'].id,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: 500, // Default price for handles
            unitsPerBag: product.stock
          }
        });
        
        // Create stock movement
        await prisma.stockMovement.create({
          data: {
            productId: newProduct.id,
            type: 'IN',
            quantity: product.stock,
            units: product.stock,
            notes: 'Initial stock'
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    console.log('\n=== 28mm Products Completed ===');
    
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCapsAndHandlesProducts();
