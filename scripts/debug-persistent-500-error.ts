import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPersistent500Error() {
  console.log('=== Debug Persistent 500 Error ===');
  
  try {
    // 1. Check if there are any database connection issues
    console.log('1. Testing database connection...');
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (error: any) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    
    // 2. Check if there are any missing required fields in Sale model
    console.log('2. Checking Sale model requirements...');
    
    const testCustomerId = 'b9949847-4e6a-4be9-aaa0-f7706ad7ecc0';
    const testProductId = 'ac662635-1746-4d32-8d2f-6694e474bc12';
    const testUserId = '4fca0830-e3f1-4677-bed3-99d39edf7276';
    
    // Check if all referenced entities exist
    const customer = await prisma.customer.findUnique({
      where: { id: testCustomerId }
    });
    
    const product = await prisma.product.findUnique({
      where: { id: testProductId }
    });
    
    const user = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    console.log('Customer exists:', !!customer);
    console.log('Product exists:', !!product);
    console.log('User exists:', !!user);
    
    if (!customer || !product || !user) {
      console.log('❌ Missing referenced entities');
      return;
    }
    
    // 3. Test sale creation with minimal data
    console.log('3. Testing minimal sale creation...');
    
    try {
      const minimalSaleData = {
        customerId: testCustomerId,
        userId: testUserId,
        totalAmount: 1000,
        paidAmount: 0,
        currency: 'USD',
        paymentStatus: 'UNPAID',
        paymentDetails: '{"uzs":1000,"usd":0,"click":0}'
      };
      
      console.log('Minimal sale data:', minimalSaleData);
      
      const minimalSale = await prisma.sale.create({
        data: minimalSaleData,
        include: {
          customer: true
        }
      });
      
      console.log('✅ Minimal sale created successfully!');
      console.log('Sale ID:', minimalSale.id);
      
      // Clean up
      await prisma.sale.delete({
        where: { id: minimalSale.id }
      });
      
      console.log('✅ Minimal sale cleaned up');
      
    } catch (error: any) {
      console.log('❌ Minimal sale failed:', error.message);
      
      if (error.code) {
        console.log('Error code:', error.code);
      }
      
      if (error.meta) {
        console.log('Error meta:', error.meta);
      }
    }
    
    // 4. Test sale creation with items
    console.log('4. Testing sale with items...');
    
    try {
      const saleWithItemsData = {
        customerId: testCustomerId,
        userId: testUserId,
        totalAmount: 1000,
        paidAmount: 0,
        currency: 'USD',
        paymentStatus: 'UNPAID',
        paymentDetails: '{"uzs":1000,"usd":0,"click":0}',
        items: {
          create: [{
            productId: testProductId,
            quantity: 1,
            pricePerBag: 1000,
            subtotal: 1000,
            saleType: 'bag'
          }]
        }
      };
      
      console.log('Sale with items data:', saleWithItemsData);
      
      const saleWithItems = await prisma.sale.create({
        data: saleWithItemsData,
        include: {
          customer: true,
          items: true
        }
      });
      
      console.log('✅ Sale with items created successfully!');
      console.log('Sale ID:', saleWithItems.id);
      console.log('Items count:', saleWithItems.items?.length || 0);
      
      // Clean up
      await prisma.saleItem.deleteMany({
        where: { saleId: saleWithItems.id }
      });
      
      await prisma.sale.delete({
        where: { id: saleWithItems.id }
      });
      
      console.log('✅ Sale with items cleaned up');
      
    } catch (error: any) {
      console.log('❌ Sale with items failed:', error.message);
      
      if (error.code) {
        console.log('Error code:', error.code);
      }
      
      if (error.meta) {
        console.log('Error meta:', error.meta);
      }
    }
    
    // 5. Check database constraints
    console.log('5. Checking database constraints...');
    
    // Check if there are any foreign key constraints
    const saleItems = await prisma.saleItem.findMany({
      take: 1,
      include: {
        product: true,
        sale: true
      }
    });
    
    console.log('Sample sale items:', saleItems.length);
    
    if (saleItems.length > 0) {
      console.log('Sample item:', {
        id: saleItems[0].id,
        productId: saleItems[0].productId,
        saleId: saleItems[0].saleId,
        productName: saleItems[0].product?.name,
        saleIdentifier: saleItems[0].sale?.id
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('=== Debug Complete ===');
}
 
debugPersistent500Error();

