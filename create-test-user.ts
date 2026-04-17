import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🔧 Test foydalanuvchi yaratilmoqda...');
  
  try {
    const password = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@zavod.uz' },
      update: {
        password,
        active: true,
      },
      create: {
        email: 'test@zavod.uz',
        login: 'testuser',
        password,
        name: 'Test User',
        role: 'ADMIN',
        active: true,
      },
    });
    
    console.log('✅ Test foydalanuvchi yaratildi:', user.email);
    console.log('   Login: test@zavod.uz');
    console.log('   Parol: test123');
    console.log('   Rol: ADMIN');
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
