const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addProduct() {
  console.log('\n=== MAHSULOT QO\'SHISH ===');
  
  const name = await question('Mahsulot nomi: ');
  const bagType = await question('Qop turi (SMALL/LARGE): ');
  const unitsPerBag = parseInt(await question('Bir qopdagi dona soni: '));
  const minStockLimit = parseInt(await question('Minimal zaxira: '));
  const optimalStock = parseInt(await question('Optimal zaxira: '));
  const maxCapacity = parseInt(await question('Maksimal sig\'im: '));
  const currentStock = parseInt(await question('Joriy zaxira (qop soni): '));
  const pricePerBag = parseFloat(await question('Bir qop narxi ($): '));
  const productionCost = parseFloat(await question('Ishlab chiqarish narxi ($): '));
  
  try {
    const product = await prisma.product.create({
      data: {
        name,
        bagType,
        unitsPerBag,
        minStockLimit,
        optimalStock,
        maxCapacity,
        currentStock,
        currentUnits: currentStock * unitsPerBag,
        pricePerBag,
        productionCost,
        isParent: false,
        active: true
      }
    });
    
    console.log(`✅ Mahsulot qo'shildi: ${product.name} (ID: ${product.id})`);
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

async function addCustomer() {
  console.log('\n=== MIJOZ QO\'SHISH ===');
  
  const name = await question('Mijoz nomi: ');
  const phone = await question('Telefon raqami: ');
  const address = await question('Manzil: ');
  const creditLimit = parseFloat(await question('Kredit limiti ($): ') || '0');
  const paymentTermDays = parseInt(await question('To\'lov muddati (kun): ') || '30');
  const discountPercent = parseFloat(await question('Chegirma (%): ') || '0');
  
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        address,
        creditLimit,
        paymentTermDays,
        discountPercent,
        category: 'NORMAL',
        notificationsEnabled: true,
        debtReminderDays: 7,
        balance: 0,
        balanceUZS: 0,
        balanceUSD: 0,
        debt: 0,
        debtUZS: 0,
        debtUSD: 0
      }
    });
    
    console.log(`✅ Mijoz qo'shildi: ${customer.name} (ID: ${customer.id})`);
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

async function addUser() {
  console.log('\n=== FOYDALANUVCHI QO\'SHISH ===');
  
  const email = await question('Email: ');
  const password = await question('Parol: ');
  const name = await question('Ism: ');
  const role = await question('Rol (ADMIN/SELLER/WAREHOUSE_MANAGER/ACCOUNTANT/DRIVER/CASHIER): ');
  
  // Parolni hash qilish
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        active: true
      }
    });
    
    console.log(`✅ Foydalanuvchi qo'shildi: ${user.name} (ID: ${user.id})`);
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

async function showMenu() {
  console.log('\n🗄️  MA\'LUMOTLAR BAZASIGA MA\'LUMOT QO\'SHISH');
  console.log('1. Mahsulot qo\'shish');
  console.log('2. Mijoz qo\'shish');
  console.log('3. Foydalanuvchi qo\'shish');
  console.log('4. Chiqish');
  
  const choice = await question('Tanlang (1-4): ');
  
  switch (choice) {
    case '1':
      await addProduct();
      break;
    case '2':
      await addCustomer();
      break;
    case '3':
      await addUser();
      break;
    case '4':
      console.log('Dasturdan chiqyapti...');
      rl.close();
      await prisma.$disconnect();
      return;
    default:
      console.log('❌ Noto\'g\'ri tanlov!');
  }
  
  // Qayta menyu
  await showMenu();
}

// Dasturni ishga tushirish
showMenu().catch(console.error);
