import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkCashierUser() {
  const cashier = await prisma.user.findUnique({
    where: { login: 'cashier' },
    select: { 
      id: true, 
      login: true, 
      name: true, 
      role: true, 
      active: true,
      password: true
    }
  });
  
  console.log('Cashier user:', cashier);
  
  if (cashier) {
    // Password check
    const isValid = await bcrypt.compare('cashier', cashier.password);
    console.log('Password valid:', isValid);
    
    // Role check
    const allowedRoles = ['cashier', 'seller'];
    const roleAllowed = allowedRoles.includes(cashier.role?.toLowerCase());
    console.log('Role allowed:', roleAllowed, '- Current role:', cashier.role);
  }
  
  await prisma.$disconnect();
}

checkCashierUser().catch(console.error);
