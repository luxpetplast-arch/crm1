import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductTypeId() {
  console.log('=== Fix Missing ProductTypeId ===');
  
  try {
    // 1. Get all products without productTypeId
    console.log('1. Finding products without productTypeId...');
    const productsWithoutTypeId = await prisma.product.findMany({
      where: {
        productTypeId: null
      }
    });
    
    console.log(`Found ${productsWithoutTypeId.length} products without productTypeId`);
    
    if (productsWithoutTypeId.length > 0) {
      // 2. Get the first product type (should be PREFORM or similar)
      console.log('2. Getting available product types...');
      const productTypes = await prisma.productType.findMany({
        take: 5
      });
      
      if (productTypes.length > 0) {
        console.log('Available product types:');
        productTypes.forEach((type, index) => {
          console.log(`  ${index + 1}. ${type.name} (ID: ${type.id})`);
        });
        
        // Use the first product type (usually PREFORM)
        const defaultProductType = productTypes[0];
        console.log(`Using default product type: ${defaultProductType.name}`);
        
        // 3. Update all products without productTypeId
        console.log('3. Updating products...');
        
        for (const product of productsWithoutTypeId) {
          console.log(`Updating ${product.name}: null -> ${defaultProductType.id}`);
          
          await prisma.product.update({
            where: { id: product.id },
            data: {
              productTypeId: defaultProductType.id
            }
          });
        }
        
        console.log('✅ ProductTypeId updated successfully!');
        
        // 4. Verify updates
        console.log('4. Verifying updates...');
        const stillMissingTypeId = await prisma.product.findMany({
          where: {
            productTypeId: null
          }
        });
        
        if (stillMissingTypeId.length === 0) {
          console.log('✅ All products now have productTypeId!');
        } else {
          console.log(`⚠️ Still ${stillMissingTypeId.length} products without productTypeId`);
        }
        
        // 5. Test sale creation after fix
        console.log('5. Testing sale creation after fix...');
        
        const testProduct = await prisma.product.findFirst({
          where: {
            productTypeId: { not: null }
          }
        });
        
        if (testProduct) {
          console.log('Test product:', {
            name: testProduct.name,
            id: testProduct.id,
            productTypeId: testProduct.productTypeId,
            categoryId: testProduct.categoryId,
            sizeId: testProduct.sizeId
          });
          
          // Test manual sale creation
          try {
            const testCustomer = await prisma.customer.findFirst();
            
            if (testCustomer) {
              const manualSale = await prisma.sale.create({
                data: {
                  customerId: testCustomer.id,
                  items: {
                    create: [{
                      productId: testProduct.id,
                      quantity: 1,
                      pricePerBag: testProduct.pricePerBag,
                      subtotal: testProduct.pricePerBag,
                      saleType: 'bag'
                    }]
                  },
                  totalAmount: testProduct.pricePerBag,
                  paidAmount: 0,
                  debtAmount: testProduct.pricePerBag,
                  currency: 'USD',
                  paymentStatus: 'UNPAID',
                  paymentDetails: JSON.stringify({
                    uzs: testProduct.pricePerBag,
                    usd: 0,
                    click: 0
                  }),
                  notes: 'Test sale after productTypeId fix',
                  user: {
                    connect: { id: '4fca0830-e3f1-4677-bed3-99d39edf7276' } // Default cashier user
                  }
                },
                include: {
                  items: true,
                  customer: true
                }
              });
              
              console.log('✅ Test sale created successfully!');
              console.log('Sale ID:', manualSale.id);
              
              // Clean up test sale
              await prisma.saleItem.deleteMany({
                where: { saleId: manualSale.id }
              });
              
              await prisma.sale.delete({
                where: { id: manualSale.id }
              });
              
              console.log('✅ Test sale cleaned up');
              
            } else {
              console.log('❌ No customer found for test');
            }
            
          } catch (error: any) {
            console.log('❌ Test sale creation failed:', error.message);
            
            if (error.code) {
              console.log('Error code:', error.code);
            }
          }
          
        } else {
          console.log('❌ No product found for testing');
        }
        
      } else {
        console.log('❌ No product types found');
      }
      
    } else {
      console.log('✅ All products already have productTypeId!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing productTypeId:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('=== Fix Complete ===');
}

fixProductTypeId();
