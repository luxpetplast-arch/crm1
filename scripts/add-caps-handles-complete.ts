import { prisma } from '../server/utils/prisma';

async function addCapsAndHandlesComplete() {
  console.log('Adding all caps and handles products...');
  
  try {
    // Check existing data
    const productTypes = await prisma.productType.findMany();
    const productCategories = await prisma.productCategory.findMany();
    const productSizes = await prisma.productSize.findMany();
    
    console.log('Existing product types:', productTypes.map(t => t.name));
    console.log('Existing product categories:', productCategories.map(c => c.name));
    console.log('Existing product sizes:', productSizes.map(s => s.name));
    
    // Get or create types
    let capsType = productTypes.find(t => t.name === 'Qopqoq') || 
                   await prisma.productType.create({ data: { name: 'Qopqoq' } });
    let handlesType = productTypes.find(t => t.name === 'Ruchka') || 
                     await prisma.productType.create({ data: { name: 'Ruchka' } });
    
    console.log('Product types ready');
    
    // Get or create categories
    let dkmCategory = productCategories.find(c => c.name === 'DKM');
    let standardCategory = productCategories.find(c => c.name === 'Standard');
    
    if (!dkmCategory) {
      dkmCategory = await prisma.productCategory.create({
        data: { 
          name: 'DKM',
          productTypeId: capsType.id
        }
      });
    }
    
    if (!standardCategory) {
      standardCategory = await prisma.productCategory.create({
        data: { 
          name: 'Standard',
          productTypeId: capsType.id
        }
      });
    }
    
    console.log('Categories ready');
    
    // Use existing sizes or create new ones
    const sizes = ['28mm', '38mm', '48mm', '55mm'];
    const createdSizes = {};
    
    for (const sizeName of sizes) {
      // Find existing size
      let existingSize = productSizes.find(s => s.name === sizeName);
      
      if (!existingSize) {
        // Create new size if it doesn't exist
        existingSize = await prisma.productSize.create({
          data: {
            name: sizeName,
            unit: 'mm',
            value: parseFloat(sizeName.replace('mm', '')),
            categoryId: standardCategory.id
          }
        });
        console.log(`Created new size: ${sizeName}`);
      } else {
        console.log(`Using existing size: ${sizeName}`);
      }
      
      createdSizes[sizeName] = existingSize;
    }
    
    console.log('Sizes ready');
    
    // 28mm Products
    console.log('\n=== Creating 28mm Products ===');
    
    const products28mm = [
      // Standard caps (6000 dona)
      { name: 'Qopqoq 28 Ko\'k gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Havo rang (Galuboy) gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Sariq gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Yashil gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Qizil gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Oq', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      { name: 'Qopqoq 28 Qora gaz', type: capsType.id, category: standardCategory.id, stock: 6000, price: 1000 },
      
      // DKM caps
      { name: 'Qopqoq 28 DKM Sariq', type: capsType.id, category: dkmCategory.id, stock: 4000, price: 1200 },
      { name: 'Qopqoq 28 DKM Ko\'k', type: capsType.id, category: dkmCategory.id, stock: 10000, price: 1200 },
      { name: 'Qopqoq 28 DKM Ko\'k (2)', type: capsType.id, category: dkmCategory.id, stock: 6000, price: 1200 },
      { name: 'Qopqoq 28 DKM Yashil', type: capsType.id, category: dkmCategory.id, stock: 4000, price: 1200 },
      
      // Handles
      { name: 'Ruchka 28 Sariq', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 500 },
      { name: 'Ruchka 28 Sariq (2)', type: handlesType.id, category: standardCategory.id, stock: 2500, price: 500 }
    ];
    
    for (const product of products28mm) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            bagType: product.type === capsType.id ? 'CAP' : 'HANDLE',
            unitsPerBag: product.stock,
            minStockLimit: Math.floor(product.stock * 0.1), // 10% of stock
            optimalStock: Math.floor(product.stock * 0.5), // 50% of stock
            maxCapacity: product.stock,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: product.price,
            pricePerPiece: product.price / product.stock,
            productionCost: 0,
            isParent: false,
            productTypeId: product.type,
            warehouse: product.type === capsType.id ? 'caps' : 'handles',
            categoryId: product.category,
            sizeId: createdSizes['28mm'].id,
            active: true
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    // 38mm Products
    console.log('\n=== Creating 38mm Products ===');
    
    const products38mm = [
      // Caps (3000 dona)
      { name: 'Qopqoq 38 Ko\'k', type: capsType.id, category: standardCategory.id, stock: 3000, price: 1000 },
      { name: 'Qopqoq 38 Sariq', type: capsType.id, category: standardCategory.id, stock: 3000, price: 1000 },
      { name: 'Qopqoq 38 Yashil', type: capsType.id, category: standardCategory.id, stock: 3000, price: 1000 },
      { name: 'Qopqoq 38 Oq', type: capsType.id, category: standardCategory.id, stock: 3000, price: 1000 },
      { name: 'Qopqoq 38 Qizil', type: capsType.id, category: standardCategory.id, stock: 3000, price: 1000 },
      
      // Handles (3000 dona)
      { name: 'Ruchka 38 Ko\'k', type: handlesType.id, category: standardCategory.id, stock: 3000, price: 500 },
      { name: 'Ruchka 38 Sariq', type: handlesType.id, category: standardCategory.id, stock: 3000, price: 500 },
      { name: 'Ruchka 38 Yashil', type: handlesType.id, category: standardCategory.id, stock: 3000, price: 500 },
      { name: 'Ruchka 38 Oq', type: handlesType.id, category: standardCategory.id, stock: 3000, price: 500 },
      { name: 'Ruchka 38 Qizil', type: handlesType.id, category: standardCategory.id, stock: 3000, price: 500 }
    ];
    
    for (const product of products38mm) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            bagType: product.type === capsType.id ? 'CAP' : 'HANDLE',
            unitsPerBag: product.stock,
            minStockLimit: Math.floor(product.stock * 0.1),
            optimalStock: Math.floor(product.stock * 0.5),
            maxCapacity: product.stock,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: product.price,
            pricePerPiece: product.price / product.stock,
            productionCost: 0,
            isParent: false,
            productTypeId: product.type,
            warehouse: product.type === capsType.id ? 'caps' : 'handles',
            categoryId: product.category,
            sizeId: createdSizes['38mm'].id,
            active: true
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    // 48mm Products
    console.log('\n=== Creating 48mm Products ===');
    
    const products48mm = [
      // Caps (2000 dona)
      { name: 'Qopqoq 48 Ko\'k', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Sariq', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Yashil', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Apelsin (to\'q sariq)', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Qizil', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Oq', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Salat rang', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1000 },
      { name: 'Qopqoq 48 Donya (Brend)', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1500 },
      { name: 'Qopqoq 48 Bekajon (Brend)', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1500 },
      { name: 'Qopqoq 48 Sayhun (Brend)', type: capsType.id, category: standardCategory.id, stock: 2000, price: 1500 },
      
      // Handles (1500 dona) - pricePerPiece = 0.017
      { name: 'Ruchka 48 Ko\'k', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Sariq', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Yashil', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Apelsin (to\'q sariq)', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Qizil', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Oq', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Qora', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Donya (Brend)', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 },
      { name: 'Ruchka 48 Bekajon (Brend)', type: handlesType.id, category: standardCategory.id, stock: 1500, price: 25.5 }
    ];
    
    for (const product of products48mm) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            bagType: product.type === capsType.id ? 'CAP' : 'HANDLE',
            unitsPerBag: product.stock,
            minStockLimit: Math.floor(product.stock * 0.1),
            optimalStock: Math.floor(product.stock * 0.5),
            maxCapacity: product.stock,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: product.price,
            pricePerPiece: product.price / product.stock,
            productionCost: 0,
            isParent: false,
            productTypeId: product.type,
            warehouse: product.type === capsType.id ? 'caps' : 'handles',
            categoryId: product.category,
            sizeId: createdSizes['48mm'].id,
            active: true
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    // 55mm Products
    console.log('\n=== Creating 55mm Products ===');
    
    const products55mm = [
      // Caps (500 dona)
      { name: 'Qopqoq 55 Havo rang (Galuboy)', type: capsType.id, category: standardCategory.id, stock: 500, price: 1000 }
    ];
    
    for (const product of products55mm) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            bagType: 'CAP',
            unitsPerBag: product.stock,
            minStockLimit: Math.floor(product.stock * 0.1),
            optimalStock: Math.floor(product.stock * 0.5),
            maxCapacity: product.stock,
            currentStock: product.stock,
            currentUnits: product.stock,
            pricePerBag: product.price,
            pricePerPiece: product.price / product.stock,
            productionCost: 0,
            isParent: false,
            productTypeId: product.type,
            warehouse: 'caps',
            categoryId: product.category,
            sizeId: createdSizes['55mm'].id,
            active: true
          }
        });
        
        console.log(`Created: ${product.name} - Stock: ${product.stock}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    console.log('\n=== All Products Added Successfully ===');
    
    // Summary
    const totalProducts = await prisma.product.count();
    const capsProducts = await prisma.product.count({ where: { productTypeId: capsType.id } });
    const handlesProducts = await prisma.product.count({ where: { productTypeId: handlesType.id } });
    
    console.log(`\nSummary:`);
    console.log(`Total products in database: ${totalProducts}`);
    console.log(`Caps products: ${capsProducts}`);
    console.log(`Handles products: ${handlesProducts}`);
    
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCapsAndHandlesComplete();
