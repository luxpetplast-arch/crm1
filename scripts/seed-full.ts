import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 To\'liq test ma\'lumotlarni yaratish boshlandi...\n');

  // 1. Foydalanuvchilar
  console.log('👤 Foydalanuvchilar yaratilmoqda...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aziztrades.com' },
    update: {},
    create: {
      email: 'admin@aziztrades.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@aziztrades.com' },
    update: {},
    create: {
      email: 'seller@aziztrades.com',
      password: sellerPassword,
      name: 'Sotuvchi',
      role: 'SELLER'
    }
  });

  console.log('✅ 2 ta foydalanuvchi yaratildi\n');

  // 2. Mahsulotlar
  console.log('📦 Mahsulotlar yaratilmoqda...');
  
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '28mm Preform',
        bagType: 'STANDARD',
        unitsPerBag: 1000,
        pricePerBag: 50.00,
        currentStock: 100,
        minStockLimit: 20,
        optimalStock: 150,
        maxCapacity: 200
      }
    }),
    prisma.product.create({
      data: {
        name: '30mm Preform',
        bagType: 'STANDARD',
        unitsPerBag: 1000,
        pricePerBag: 55.00,
        currentStock: 80,
        minStockLimit: 15,
        optimalStock: 120,
        maxCapacity: 180
      }
    }),
    prisma.product.create({
      data: {
        name: '38mm Preform',
        bagType: 'STANDARD',
        unitsPerBag: 800,
        pricePerBag: 60.00,
        currentStock: 60,
        minStockLimit: 10,
        optimalStock: 100,
        maxCapacity: 150
      }
    }),
    prisma.product.create({
      data: {
        name: '48mm Preform',
        bagType: 'LARGE',
        unitsPerBag: 600,
        pricePerBag: 70.00,
        currentStock: 40,
        minStockLimit: 8,
        optimalStock: 80,
        maxCapacity: 120
      }
    }),
    prisma.product.create({
      data: {
        name: '0.5L Bottle',
        bagType: 'STANDARD',
        unitsPerBag: 500,
        pricePerBag: 45.00,
        currentStock: 120,
        minStockLimit: 25,
        optimalStock: 180,
        maxCapacity: 250
      }
    }),
    prisma.product.create({
      data: {
        name: '1.0L Bottle',
        bagType: 'STANDARD',
        unitsPerBag: 400,
        pricePerBag: 50.00,
        currentStock: 90,
        minStockLimit: 20,
        optimalStock: 150,
        maxCapacity: 200
      }
    }),
    prisma.product.create({
      data: {
        name: '1.5L Bottle',
        bagType: 'STANDARD',
        unitsPerBag: 300,
        pricePerBag: 55.00,
        currentStock: 70,
        minStockLimit: 15,
        optimalStock: 120,
        maxCapacity: 180
      }
    }),
    prisma.product.create({
      data: {
        name: '2.0L Bottle',
        bagType: 'LARGE',
        unitsPerBag: 250,
        pricePerBag: 60.00,
        currentStock: 50,
        minStockLimit: 10,
        optimalStock: 100,
        maxCapacity: 150
      }
    }),
    prisma.product.create({
      data: {
        name: 'PET Granule',
        bagType: 'BULK',
        unitsPerBag: 25,
        pricePerBag: 1200.00,
        currentStock: 200,
        minStockLimit: 50,
        optimalStock: 300,
        maxCapacity: 500
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bottle Cap',
        bagType: 'STANDARD',
        unitsPerBag: 5000,
        pricePerBag: 30.00,
        currentStock: 150,
        minStockLimit: 30,
        optimalStock: 200,
        maxCapacity: 300
      }
    })
  ]);

  console.log(`✅ ${products.length} ta mahsulot yaratildi\n`);

  // 3. Mijozlar
  console.log('👥 Mijozlar yaratilmoqda...');
  
  const customers = await Promise.all([
    // VIP mijozlar
    prisma.customer.create({
      data: {
        name: 'Aziz Savdo',
        phone: '+998901234567',
        address: 'Toshkent, Chilonzor',
        category: 'VIP',
        balance: 0,
        debt: 0,
        telegramChatId: '123456789',
        telegramUsername: 'aziz_savdo'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Mega Trade',
        phone: '+998902345678',
        address: 'Toshkent, Yunusobod',
        category: 'VIP',
        balance: -5000,
        debt: 5000,
        telegramChatId: '234567890',
        telegramUsername: 'mega_trade'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Premium Savdo',
        phone: '+998903456789',
        address: 'Samarqand',
        category: 'VIP',
        balance: 0,
        debt: 0
      }
    }),
    // Regular mijozlar
    ...Array.from({ length: 10 }, (_, i) => 
      prisma.customer.create({
        data: {
          name: `Mijoz ${i + 1}`,
          phone: `+99890${4000000 + i}`,
          address: `Toshkent, Manzil ${i + 1}`,
          category: 'NORMAL',
          balance: Math.random() > 0.5 ? -Math.floor(Math.random() * 3000) : 0,
          debt: Math.random() > 0.5 ? Math.floor(Math.random() * 3000) : 0
        }
      })
    ),
    // At-Risk mijozlar
    ...Array.from({ length: 5 }, (_, i) => 
      prisma.customer.create({
        data: {
          name: `Xavfli Mijoz ${i + 1}`,
          phone: `+99890${5000000 + i}`,
          address: `Toshkent, Manzil ${i + 20}`,
          category: 'RISK',
          balance: -Math.floor(Math.random() * 5000 + 3000),
          debt: Math.floor(Math.random() * 5000 + 3000)
        }
      })
    ),
    // Inactive mijozlar
    ...Array.from({ length: 2 }, (_, i) => 
      prisma.customer.create({
        data: {
          name: `Nofaol Mijoz ${i + 1}`,
          phone: `+99890${6000000 + i}`,
          address: `Toshkent, Manzil ${i + 30}`,
          category: 'INACTIVE',
          balance: 0,
          debt: 0
        }
      })
    )
  ]);

  console.log(`✅ ${customers.length} ta mijoz yaratildi\n`);

  // 4. Sotuvlar
  console.log('💰 Sotuvlar yaratilmoqda...');
  
  const sales = [];
  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 20) + 5;
    const totalAmount = quantity * product.pricePerBag;
    const paidAmount = Math.random() > 0.3 ? totalAmount : totalAmount * (Math.random() * 0.7 + 0.3);
    
    const sale = await prisma.sale.create({
      data: {
        customerId: customer.id,
        userId: admin.id,
        productId: product.id,
        quantity: quantity,
        pricePerBag: product.pricePerBag,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        currency: 'USD',
        paymentStatus: paidAmount >= totalAmount ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
        paymentDetails: JSON.stringify({
          uzs: Math.floor(paidAmount * 12500 * 0.6),
          usd: paidAmount * 0.3,
          click: Math.floor(paidAmount * 12500 * 0.1)
        }),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    });
    sales.push(sale);
  }

  console.log(`✅ ${sales.length} ta sotuv yaratildi\n`);

  // 5. Buyurtmalar
  console.log('📋 Buyurtmalar yaratilmoqda...');
  
  const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'SOLD'];
  const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  
  const orders = [];
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantityBags = Math.floor(Math.random() * 50) + 10;
    const quantityUnits = Math.floor(Math.random() * 200) + 50;
    const pricePerBag = product.pricePerBag;
    const totalAmount = quantityBags * pricePerBag;
    
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(i + 1).padStart(5, '0')}`,
        customerId: customer.id,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        requestedDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        promisedDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        totalAmount: totalAmount,
        paidAmount: 0,
        notes: `Test buyurtma ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
      }
    });
    
    // OrderItem yaratish
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantityBags: quantityBags,
        quantityUnits: quantityUnits,
        pricePerBag: pricePerBag,
        subtotal: totalAmount
      }
    });
    
    orders.push(order);
  }

  console.log(`✅ ${orders.length} ta buyurtma yaratildi\n`);

  // 6. Xarajatlar
  console.log('💸 Xarajatlar yaratilmoqda...');
  
  const expenseCategories = ['SALARY', 'UTILITIES', 'MAINTENANCE', 'TRANSPORT', 'OTHER'];
  
  const expenses = [];
  for (let i = 0; i < 20; i++) {
    const expense = await prisma.expense.create({
      data: {
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        amount: Math.floor(Math.random() * 5000) + 500,
        currency: Math.random() > 0.5 ? 'UZS' : 'USD',
        description: `Test xarajat ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    });
    expenses.push(expense);
  }

  console.log(`✅ ${expenses.length} ta xarajat yaratildi\n`);

  console.log('✅ Barcha test ma\'lumotlar muvaffaqiyatli yaratildi!\n');
  console.log('📊 Statistika:');
  console.log(`   - Foydalanuvchilar: 2`);
  console.log(`   - Mahsulotlar: ${products.length}`);
  console.log(`   - Mijozlar: ${customers.length}`);
  console.log(`   - Sotuvlar: ${sales.length}`);
  console.log(`   - Buyurtmalar: ${orders.length}`);
  console.log(`   - Xarajatlar: ${expenses.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Xatolik:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
