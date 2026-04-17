import { prisma } from '../server/utils/prisma';

async function setupPreformProducts() {
  console.log('Setting up preform products structure...');
  
  try {
    // 1. Create ProductType for Preform
    let productType = await prisma.productType.findFirst({
      where: { name: 'Preform' }
    });
    
    if (!productType) {
      productType = await prisma.productType.create({
        data: {
          name: 'Preform',
          description: 'PET preform products',
          active: true
        }
      });
      console.log('Created ProductType: Preform');
    }
    
    // 2. Create ProductCategory for Preform
    let category = await prisma.productCategory.findFirst({
      where: { 
        name: 'Preform',
        productTypeId: productType.id 
      }
    });
    
    if (!category) {
      category = await prisma.productCategory.create({
        data: {
          name: 'Preform',
          description: 'PET preform products',
          icon: ' Bottle',
          color: '#3B82F6',
          active: true,
          productTypeId: productType.id
        }
      });
      console.log('Created ProductCategory: Preform');
    }
    
    // 3. Create ProductSizes
    const sizes = [
      { name: '15gr', value: 15, unit: 'gr', description: '15 gramm preform' },
      { name: '21gr', value: 21, unit: 'gr', description: '21 gramm preform' },
      { name: '26gr', value: 26, unit: 'gr', description: '26 gramm preform' },
      { name: '30gr', value: 30, unit: 'gr', description: '30 gramm preform' },
      { name: '36gr', value: 36, unit: 'gr', description: '36 gramm preform' },
      { name: '52gr', value: 52, unit: 'gr', description: '52 gramm preform' },
      { name: '70gr', value: 70, unit: 'gr', description: '70 gramm preform' },
      { name: '75gr', value: 75, unit: 'gr', description: '75 gramm preform' },
      { name: '80gr', value: 80, unit: 'gr', description: '80 gramm preform' },
      { name: '85gr', value: 85, unit: 'gr', description: '85 gramm preform' },
      { name: '86gr', value: 86, unit: 'gr', description: '86 gramm preform' },
      { name: '135gr', value: 135, unit: 'gr', description: '135 gramm preform' },
      { name: '250gr', value: 250, unit: 'gr', description: '250 gramm preform' }
    ];
    
    const createdSizes: { [key: string]: any } = {};
    for (const size of sizes) {
      let existingSize = await prisma.productSize.findFirst({
        where: { 
          name: size.name,
          categoryId: category.id 
        }
      });
      
      if (!existingSize) {
        existingSize = await prisma.productSize.create({
          data: {
            name: size.name,
            value: size.value,
            unit: size.unit,
            description: size.description,
            active: true,
            categoryId: category.id
          }
        });
        console.log(`Created ProductSize: ${size.name}`);
      }
      createdSizes[size.name] = existingSize;
    }
    
    // 4. Create Products with variants
    const products = [
      // 15 gr products (20,000 dona = 20 qop)
      { size: '15gr', variant: 'prozrach', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      { size: '15gr', variant: 'gidro', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      { size: '15gr', variant: 'siniy', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      { size: '15gr', variant: 'sprite', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      { size: '15gr', variant: 'kizil', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      { size: '15gr', variant: 'kora', quantity: 20000, bags: 20, unitsPerBag: 1000 },
      
      // 21 gr products (15,000 dona = 15 qop)
      { size: '21gr', variant: 'prozrach', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'gidro', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'gd Oqtosh', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'siniy', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'sprite', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'yod', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      { size: '21gr', variant: 'ok', quantity: 15000, bags: 15, unitsPerBag: 1000 },
      
      // 26 gr products (12,000 dona = 12 qop)
      { size: '26gr', variant: 'yog', quantity: 12000, bags: 12, unitsPerBag: 1000 },
      
      // 30 gr products (10,000 dona = 10 qop)
      { size: '30gr', variant: 'prozrach', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      { size: '30gr', variant: 'gidro', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      { size: '30gr', variant: 'gd Oqtosh', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      { size: '30gr', variant: 'sprite', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      { size: '30gr', variant: 'siniy', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      
      // 36 gr products (10,000 dona = 10 qop)
      { size: '36gr', variant: 'yog', quantity: 10000, bags: 10, unitsPerBag: 1000 },
      
      // 52 gr products (6,000 dona = 6 qop)
      { size: '52gr', variant: 'prozrach', quantity: 6000, bags: 6, unitsPerBag: 1000 },
      { size: '52gr', variant: 'ok', quantity: 6000, bags: 6, unitsPerBag: 1000 },
      
      // 70 gr products (4,500 dona = 4.5 qop)
      { size: '70gr', variant: 'prozrach', quantity: 4500, bags: 4.5, unitsPerBag: 1000 },
      { size: '70gr', variant: 'gidro', quantity: 4500, bags: 4.5, unitsPerBag: 1000 },
      { size: '70gr', variant: 'sayxun', quantity: 4500, bags: 4.5, unitsPerBag: 1000 },
      { size: '70gr', variant: 'siniy', quantity: 4500, bags: 4.5, unitsPerBag: 1000 },
      
      // 75 gr products (4,000 dona = 4 qop va 3,000 dona = 3 qop)
      { size: '75gr', variant: 'prozrach', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '75gr', variant: 'prozrach-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '75gr', variant: 'sayxun', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '75gr', variant: 'gidro', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '75gr', variant: 'gidro-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '75gr', variant: 'siniy', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '75gr', variant: 'siniy-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      
      // 80 gr products (4,000 dona = 4 qop va 3,000 dona = 3 qop)
      { size: '80gr', variant: 'prozrach', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '80gr', variant: 'prozrach-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '80gr', variant: 'gidro', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '80gr', variant: 'gidro-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '80gr', variant: 'sayxun', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '80gr', variant: 'sayxun-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '80gr', variant: 'siniy', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '80gr', variant: 'siniy-3000', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      
      // 85-86 gr products (4,000 dona = 4 qop va 3,000 dona = 3 qop)
      { size: '85gr', variant: 'prozrach', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '85gr', variant: 'prozrach-4000', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      { size: '86gr', variant: 'prozrach', quantity: 3000, bags: 3, unitsPerBag: 1000 },
      { size: '86gr', variant: 'prozrach-4000', quantity: 4000, bags: 4, unitsPerBag: 1000 },
      
      // 135 gr products (2,500 dona = 2.5 qop va 2,000 dona = 2 qop)
      { size: '135gr', variant: 'prozrach', quantity: 2500, bags: 2.5, unitsPerBag: 1000 },
      { size: '135gr', variant: 'prozrach-2000', quantity: 2000, bags: 2, unitsPerBag: 1000 },
      { size: '135gr', variant: 'gidro', quantity: 2500, bags: 2.5, unitsPerBag: 1000 },
      { size: '135gr', variant: 'gidro-2000', quantity: 2000, bags: 2, unitsPerBag: 1000 },
      { size: '135gr', variant: 'sayxun', quantity: 2500, bags: 2.5, unitsPerBag: 1000 },
      { size: '135gr', variant: 'sayxun +', quantity: 2500, bags: 2.5, unitsPerBag: 1000 },
      { size: '135gr', variant: 'siniy', quantity: 2500, bags: 2.5, unitsPerBag: 1000 },
      { size: '135gr', variant: 'siniy-2000', quantity: 2000, bags: 2, unitsPerBag: 1000 },
      
      // 250 gr products (2,000 dona = 2 qop)
      { size: '250gr', variant: 'nestle', quantity: 2000, bags: 2, unitsPerBag: 1000 },
      { size: '250gr', variant: 'siniy', quantity: 2000, bags: 2, unitsPerBag: 1000 }
    ];
    
    console.log('Creating products...');
    
    for (const product of products) {
      const productName = `${product.size} ${product.variant}`;
      
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { name: productName }
      });
      
      if (existingProduct) {
        console.log(`Product "${productName}" already exists, updating stock...`);
        
        // Update existing product stock
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            currentStock: product.bags,
            currentUnits: product.quantity,
            unitsPerBag: product.unitsPerBag
          }
        });
        
        // Create stock movement record
        await prisma.stockMovement.create({
          data: {
            productId: existingProduct.id,
            type: 'ADJUST',
            quantity: Math.floor(product.bags),
            units: product.quantity,
            reason: 'Initial stock setup',
            userId: 'system',
            userName: 'System',
            previousStock: 0,
            previousUnits: 0,
            newStock: Math.floor(product.bags),
            newUnits: product.quantity
          }
        });
        
        console.log(`Updated stock for: ${productName} (${product.quantity} dona, ${product.bags} qop)`);
        continue;
      }
      
      // Create new product
      const newProduct = await prisma.product.create({
        data: {
          name: productName,
          bagType: 'PREFORM',
          unitsPerBag: product.unitsPerBag,
          minStockLimit: Math.floor(product.bags * 0.2), // 20% of current stock
          optimalStock: Math.floor(product.bags * 0.5), // 50% of current stock
          maxCapacity: Math.floor(product.bags * 1.5), // 150% of current stock
          currentStock: product.bags,
          currentUnits: product.quantity,
          pricePerBag: 0, // Will be set later
          pricePerPiece: 0, // Will be set later
          productionCost: 0,
          warehouse: 'preform',
          categoryId: category.id,
          sizeId: createdSizes[product.size].id,
          subType: product.variant,
          active: true
        }
      });
      
      // Create stock movement record
      await prisma.stockMovement.create({
        data: {
          productId: newProduct.id,
          type: 'ADD',
          quantity: Math.floor(product.bags),
          units: product.quantity,
          reason: 'Initial stock setup',
          userId: 'system',
          userName: 'System',
          previousStock: 0,
          previousUnits: 0,
          newStock: Math.floor(product.bags),
          newUnits: product.quantity
        }
      });
      
      console.log(`Created product: ${productName} (${product.quantity} dona, ${product.bags} qop)`);
    }
    
    console.log('All preform products have been created successfully!');
    
  } catch (error) {
    console.error('Error setting up products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPreformProducts();
