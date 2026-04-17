import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugServer500Error() {
  console.log('=== Debug Server 500 Error ===');
  
  try {
    // 1. Check recent sales to see what's failing
    console.log('1. Checking recent sales...');
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: true
      }
    });
    
    console.log('Recent sales:', recentSales.length);
    recentSales.forEach((sale, index) => {
      console.log(`\nSale ${index + 1}:`);
      console.log('  ID:', sale.id);
      console.log('  Customer:', sale.customer?.name || 'Unknown');
      console.log('  Total Amount:', sale.totalAmount);
      console.log('  Items:', sale.items?.length || 0);
      console.log('  Created At:', sale.createdAt);
      
      if (sale.items) {
        sale.items.forEach((item, itemIndex) => {
          console.log(`    Item ${itemIndex + 1}:`);
          console.log('      Product ID:', item.productId);
          console.log('      Quantity:', item.quantity);
          console.log('      Price per Bag:', item.pricePerBag);
          console.log('      Subtotal:', item.subtotal);
          console.log('      Sale Type:', item.saleType);
        });
      }
    });
    
    // 2. Check if there are any validation issues
    console.log('\n2. Checking for validation issues...');
    
    // Test a simple sale creation manually
    const testCustomerId = recentSales[0]?.customerId;
    const testProductId = 'ac662635-1746-4d32-8d2f-6694e474bc12'; // 15gr prozrach
    
    if (testCustomerId && testProductId) {
      console.log('Testing manual sale creation...');
      
      try {
        const manualSale = await prisma.sale.create({
          data: {
            customerId: testCustomerId,
            items: {
              create: [{
                productId: testProductId,
                quantity: 1,
                pricePerBag: 1000,
                subtotal: 1000,
                saleType: 'bag'
              }]
            },
            totalAmount: 1000,
            paidAmount: 0,
            debtAmount: 1000,
            currency: 'USD',
            paymentStatus: 'UNPAID',
            paymentDetails: JSON.stringify({
              uzs: 1000,
              usd: 0,
              click: 0
            }),
            notes: 'Manual test sale'
          },
          include: {
            items: true,
            customer: true
          }
        });
        
        console.log('✅ Manual sale created successfully!');
        console.log('Sale ID:', manualSale.id);
        
        // Clean up test sale
        await prisma.saleItem.deleteMany({
          where: { saleId: manualSale.id }
        });
        
        await prisma.sale.delete({
          where: { id: manualSale.id }
        });
        
        console.log('✅ Test sale cleaned up');
        
      } catch (error: any) {
        console.log('❌ Manual sale creation failed:', error.message);
        
        if (error.code) {
          console.log('Error code:', error.code);
        }
        
        if (error.meta) {
          console.log('Error meta:', error.meta);
        }
        
        // Check if it's a constraint violation
        if (error.code === 'P2002') {
          console.log('⚠️ Foreign key constraint violation');
        }
        
        // Check if it's a unique constraint violation
        if (error.code === 'P2002') {
          console.log('⚠️ Unique constraint violation');
        }
        
        // Check if it's a validation error
        if (error.code === 'P2003') {
          console.log('⚠️ Data validation error');
        }
      }
    }
    
    // 3. Check product availability
    console.log('\n3. Checking product availability...');
    const testProduct = await prisma.product.findUnique({
      where: { id: testProductId }
    });
    
    if (testProduct) {
      console.log('Product found:', {
        name: testProduct.name,
        currentStock: testProduct.currentStock,
        pricePerBag: testProduct.pricePerBag,
        unitsPerBag: testProduct.unitsPerBag,
        categoryId: testProduct.categoryId,
        sizeId: testProduct.sizeId
      });
      
      // Check if product has all required fields
      const requiredFields = ['categoryId', 'sizeId', 'productTypeId'];
      const missingFields = requiredFields.filter(field => !testProduct[field as keyof typeof testProduct]);
      
      if (missingFields.length > 0) {
        console.log('⚠️ Missing required fields:', missingFields);
      } else {
        console.log('✅ All required fields present');
      }
    } else {
      console.log('❌ Product not found');
    }
    
    // 4. Check customer availability
    console.log('\n4. Checking customer availability...');
    if (testCustomerId) {
      const testCustomer = await prisma.customer.findUnique({
        where: { id: testCustomerId }
      });
      
      if (testCustomer) {
        console.log('Customer found:', {
          name: testCustomer.name,
          balanceUZS: testCustomer.balanceUZS,
          balanceUSD: testCustomer.balanceUSD
        });
      } else {
        console.log('❌ Customer not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n=== Debug Complete ===');
}

debugServer500Error();
