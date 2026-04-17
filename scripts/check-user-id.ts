import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const userId = '9d946fe7-7685-4f5a-b2c0-2ac36659027d';
  console.log('🔍 User ID to check:', userId);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, login: true, name: true, role: true }
  });
  
  console.log('✅ User found:', !!user);
  if (user) {
    console.log('👤 User details:', {
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role
    });
  } else {
    console.log('❌ User NOT found in database');
    
    // Barcha userlarni ko'rsatish
    const allUsers = await prisma.user.findMany({
      select: { id: true, login: true, name: true, role: true },
      take: 5
    });
    console.log('📋 Available users:', allUsers);
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
