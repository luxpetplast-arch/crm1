const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@luxpetplast.uz' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@luxpetplast.uz',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        active: true
      }
    });
    
    console.log('Admin user created/updated:', user.name);
    console.log('Login: admin@luxpetplast.uz');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
