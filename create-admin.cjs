const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('👑 Admin foydalanuvchi yaratish...\n');
  
  try {
    // Avval admin bormi tekshirish
    const existingAdmin = await prisma.user.findUnique({
      where: { login: 'admin@aziztrades.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin allaqachon mavjud!');
      console.log('Login:', existingAdmin.login);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      await prisma.$disconnect();
      return;
    }
    
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Admin yaratish
    const admin = await prisma.user.create({
      data: {
        login: 'admin@aziztrades.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        active: true
      }
    });
    
    console.log('✅ Admin muvaffaqiyatli yaratildi!');
    console.log('Login:', admin.login);
    console.log('Password: admin123');
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    await prisma.$disconnect();
  }
}

createAdmin();
