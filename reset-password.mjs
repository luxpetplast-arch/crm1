import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'admin@aziztrades.com';
  const newPassword = 'admin123';
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log('✅ Parol yangilandi:', user.email);
  console.log('🔑 Yangi parol: admin123');
}

resetPassword();
