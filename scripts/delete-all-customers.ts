// Barcha mijozlarni o'chirish skripti
// Usage: npx ts-node scripts/delete-all-customers.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllCustomers() {
  console.log('⚠️ Barcha mijozlarni o\'chirish boshlandi...\n');

  try {
    // 1. DeliveryStatusHistory (DeliveryNew ga bog'liq)
    const deliveryStatusHistory = await prisma.deliveryStatusHistory.deleteMany({});
    console.log(`✅ DeliveryStatusHistory: ${deliveryStatusHistory.count} ta o'chirildi`);

    // 2. DeliveryNew (Sale ga bog'liq)
    const deliveryNew = await prisma.deliveryNew.deleteMany({});
    console.log(`✅ DeliveryNew: ${deliveryNew.count} ta o'chirildi`);

    // 3. DeliveryAssignment (Order ga bog'liq)
    const deliveryAssignments = await prisma.deliveryAssignment.deleteMany({});
    console.log(`✅ DeliveryAssignment: ${deliveryAssignments.count} ta o'chirildi`);

    // 4. Invoices (Customer va Sale ga bog'liq)
    const invoices = await prisma.invoice.deleteMany({});
    console.log(`✅ Invoice: ${invoices.count} ta o'chirildi`);

    // 5. Payments (Customer ga bog'liq)
    const payments = await prisma.payment.deleteMany({});
    console.log(`✅ Payment: ${payments.count} ta o'chirildi`);

    // 6. Contracts (Customer ga bog'liq)
    const contracts = await prisma.contract.deleteMany({});
    console.log(`✅ Contract: ${contracts.count} ta o'chirildi`);

    // 7. CustomerChat (Customer ga bog'liq)
    const customerChats = await prisma.customerChat.deleteMany({});
    console.log(`✅ CustomerChat: ${customerChats.count} ta o'chirildi`);

    // 8. Sales (Customer ga bog'liq, SaleItem auto-cascade)
    const sales = await prisma.sale.deleteMany({});
    console.log(`✅ Sale: ${sales.count} ta o'chirildi`);

    // 9. Orders (Customer ga bog'liq, OrderItem/ProductionPlan auto-cascade)
    const orders = await prisma.order.deleteMany({});
    console.log(`✅ Order: ${orders.count} ta o'chirildi`);

    // 10. LoyaltyTransactions (LoyaltyProgram ga bog'liq)
    const loyaltyTransactions = await prisma.loyaltyTransaction.deleteMany({});
    console.log(`✅ LoyaltyTransaction: ${loyaltyTransactions.count} ta o'chirildi`);

    // 11. LoyaltyPrograms (Customer ga bog'liq)
    const loyaltyPrograms = await prisma.loyaltyProgram.deleteMany({});
    console.log(`✅ LoyaltyProgram: ${loyaltyPrograms.count} ta o'chirildi`);

    // 12. Nihoyat - Customers
    const customers = await prisma.customer.deleteMany({});
    console.log(`✅ Customer: ${customers.count} ta o'chirildi`);

    console.log('\n🎉 Barcha mijozlar muvaffaqiyatli o\'chirildi!');

  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCustomers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
