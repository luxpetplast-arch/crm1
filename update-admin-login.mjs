import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateAdminLogin() {
  const email = 'admin@aziztrades.com';
  
  const user = await prisma.user.update({
    where: { email },
    data: { login: 'admin' },
  });
  
  console.log('✅ Admin login yangilandi:', user.email, '-> login:', user.login);
}

updateAdminLogin();
