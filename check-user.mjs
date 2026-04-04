import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const userId = '8648f1a6-f803-45e8-b1a6-01273281cd9c';
  
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  console.log('User by ID:', user ? '✅ Topildi' : '❌ Yo\'q');
  
  if (!user) {
    const allUsers = await prisma.user.findMany({
      where: { email: 'admin@aziztrades.com' },
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('Barcha admin users:', allUsers);
  }
}

checkUser();
