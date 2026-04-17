// Ma'lumotlarni SQLite dan Supabase ga ko'chirish
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = 'https://gnferbxmvcyotsuxxrga.supabase.co';
const supabaseAnonKey = 'sb_publishable_eQ-0vTHkBTTYu5H4a-ZGaw_Ci6ldAoF';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Ma\'lumotlarni ko\'chirish boshlandi...');

    // 1. Mijozlarni ko'chirish
    console.log('Mijozlar ko\'chirilmoqda...');
    const localCustomers = await prisma.customer.findMany();
    
    for (const customer of localCustomers) {
      const { error } = await supabase
        .from('customers')
        .upsert({
          name: customer.name,
          phone: customer.phone || null,
          address: customer.address || null,
          email: customer.email || null,
          debt_uzs: customer.debtUZS || 0,
          debt_usd: customer.debtUSD || 0,
          total_purchases: customer.totalPurchases || 0,
          created_at: customer.createdAt,
          updated_at: customer.updatedAt
        }, {
          onConflict: 'phone'
        });
      
      if (error) {
        console.error('Mijoz ko\'chirish xatosi:', error);
      } else {
        console.log(`Mijoz ko\'chirildi: ${customer.name}`);
      }
    }

    // 2. Mahsulotlarni ko'chirish
    console.log('Mahsulotlar ko\'chirilmoqda...');
    const localProducts = await prisma.product.findMany();
    
    for (const product of localProducts) {
      const { error } = await supabase
        .from('products')
        .upsert({
          name: product.name,
          description: product.description || null,
          category: product.category || 'other',
          warehouse: product.warehouse || 'preform',
          sub_type: product.subType || null,
          units_per_bag: product.unitsPerBag || 2000,
          price_per_bag: product.pricePerBag || 0,
          current_stock: product.currentStock || 0,
          min_stock: product.minStock || 0,
          unit: product.unit || 'qop',
          barcode: product.barcode || null,
          image_url: product.imageUrl || null,
          is_active: product.isActive !== false,
          created_at: product.createdAt,
          updated_at: product.updatedAt
        }, {
          onConflict: 'name'
        });
      
      if (error) {
        console.error('Mahsulot ko\'chirish xatosi:', error);
      } else {
        console.log(`Mahsulot ko\'chirildi: ${product.name}`);
      }
    }

    // 3. Sotuvlarni ko'chirish
    console.log('Sotuvlar ko\'chirilmoqda...');
    const localSales = await prisma.sale.findMany({
      include: { items: true }
    });
    
    for (const sale of localSales) {
      const { error } = await supabase
        .from('sales')
        .insert({
          receipt_number: sale.receiptNumber,
          customer_id: sale.customerId || null,
          items: sale.items,
          total_amount: sale.totalAmount,
          paid_amount: sale.paidAmount || 0,
          debt_amount: sale.debtAmount || 0,
          currency: sale.currency || 'UZS',
          payment_details: sale.paymentDetails || {},
          is_kocha: sale.isKocha || false,
          manual_customer_name: sale.manualCustomerName || null,
          manual_customer_phone: sale.manualCustomerPhone || null,
          cashier_id: sale.cashierId || 'system',
          status: 'completed',
          created_at: sale.createdAt,
          updated_at: sale.updatedAt
        });
      
      if (error) {
        console.error('Sotuv ko\'chirish xatosi:', error);
      } else {
        console.log(`Sotuv ko\'chirildi: ${sale.receiptNumber}`);
      }
    }

    // 4. Buyurtmalarni ko'chirish
    console.log('Buyurtmalar ko\'chirilmoqda...');
    const localOrders = await prisma.order.findMany({
      include: { items: true }
    });
    
    for (const order of localOrders) {
      const { error } = await supabase
        .from('orders')
        .insert({
          order_number: order.orderNumber,
          customer_id: order.customerId || null,
          items: order.items,
          total_amount: order.totalAmount,
          status: order.status || 'pending',
          delivery_address: order.deliveryAddress || null,
          notes: order.notes || null,
          created_by: order.createdBy || 'system',
          created_at: order.createdAt,
          updated_at: order.updatedAt
        });
      
      if (error) {
        console.error('Buyurtma ko\'chirish xatosi:', error);
      } else {
        console.log(`Buyurtma ko\'chirildi: ${order.orderNumber}`);
      }
    }

    // 5. Xarajatlarni ko'chirish
    console.log('Xarajatlar ko\'chirilmoqda...');
    const localExpenses = await prisma.expense.findMany();
    
    for (const expense of localExpenses) {
      const { error } = await supabase
        .from('expenses')
        .insert({
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency || 'UZS',
          category: expense.category || 'other',
          expense_date: expense.expenseDate,
          receipt_url: expense.receiptUrl || null,
          created_by: expense.createdBy || 'system',
          created_at: expense.createdAt,
          updated_at: expense.updatedAt
        });
      
      if (error) {
        console.error('Xarajat ko\'chirish xatosi:', error);
      } else {
        console.log(`Xarajat ko\'chirildi: ${expense.description}`);
      }
    }

    // 6. Kassani ko'chirish
    console.log('Kassa ma\'lumotlari ko\'chirilmoqda...');
    const localCashbox = await prisma.cashbox.findMany();
    
    for (const cash of localCashbox) {
      const { error } = await supabase
        .from('cashbox')
        .insert({
          transaction_type: cash.transactionType,
          amount: cash.amount,
          currency: cash.currency || 'UZS',
          description: cash.description || null,
          reference_id: cash.referenceId || null,
          reference_table: cash.referenceTable || null,
          created_by: cash.createdBy || 'system',
          created_at: cash.createdAt
        });
      
      if (error) {
        console.error('Kassa ko\'chirish xatosi:', error);
      } else {
        console.log(`Kassa yozuvi ko\'chirildi: ${cash.transactionType}`);
      }
    }

    console.log('Ma\'lumotlarni ko\'chirish tugadi!');

  } catch (error) {
    console.error('Ko\'chirishda xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
