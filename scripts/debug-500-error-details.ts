import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug500ErrorDetails() {
  console.log('=== Debug 500 Error Details ===');
  
  try {
    // 1. Check server logs for specific error
    console.log('1. Checking recent error logs...');
    
    // 2. Test sale creation with exact same data as failing request
    console.log('2. Testing exact sale data...');
    
    // Get test data
    const testCustomerId = 'b9949847-4e6a-4be9-aaa0-f7706ad7ecc0';
    const testProductId = 'ac662635-1746-4d32-8d2f-6694e474bc12';
    
    console.log('Test data:');
    console.log('  Customer ID:', testCustomerId);
    console.log('  Product ID:', testProductId);
    
    // Test sale with minimal required fields
    try {
      const minimalSale = await prisma.sale.create({
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
          paymentDetails: '{"uzs":1000,"usd":0,"click":0}',
          notes: 'Minimal test sale',
          user: {
            connect: { id: '4fca0830-e3f1-4677-bed3-99d39edf7276' }
          }
        },
        include: {
          items: true,
          customer: true
        }
      });
      
      console.log('✅ Minimal sale created successfully!');
      console.log('Sale ID:', minimalSale.id);
      
      // Clean up
      await prisma.saleItem.deleteMany({
        where: { saleId: minimalSale.id }
      });
      
      await prisma.sale.delete({
        where: { id: minimalSale.id }
      });
      
      console.log('✅ Test sale cleaned up');
      
    } catch (error: any) {
      console.log('❌ Minimal sale failed:', error.message);
      
      if (error.code) {
        console.log('Error code:', error.code);
        
        // Check specific error codes
        switch (error.code) {
          case 'P2002':
            console.log('⚠️ Foreign key constraint violation');
            break;
          case 'P2003':
            console.log('⚠️ Data validation error');
            break;
          case 'P2025':
            console.log('⚠️ Unique constraint violation');
            break;
          default:
            console.log('⚠️ Unknown Prisma error:', error.code);
        }
      }
      
      if (error.meta) {
        console.log('Error meta:', error.meta);
      }
      
      if (error.cause) {
        console.log('Error cause:', error.cause);
      }
    }
    
    // 3. Check database connection and constraints
    console.log('3. Checking database constraints...');
    
    const customer = await prisma.customer.findUnique({
      where: { id: testCustomerId }
    });
    
    const product = await prisma.product.findUnique({
      where: { id: testProductId }
    });
    
    console.log('Customer exists:', !!customer);
    console.log('Product exists:', !!product);
    
    if (customer && product) {
      console.log('Customer:', {
        id: customer.id,
        name: customer.name
      });
      
      console.log('Product:', {
        id: product.id,
        name: product.name,
        productTypeId: product.productTypeId,
        categoryId: product.categoryId,
        sizeId: product.sizeId
      });
      
      // Check if all required fields are present
      const requiredProductFields = ['productTypeId', 'categoryId', 'sizeId'];
      const missingProductFields = requiredProductFields.filter(field => !product[field as keyof typeof product]);
      
      if (missingProductFields.length > 0) {
        console.log('⚠️ Missing product fields:', missingProductFields);
      } else {
        console.log('✅ All product fields present');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('=== Debug Complete ===');
}

debug500ErrorDetails();
