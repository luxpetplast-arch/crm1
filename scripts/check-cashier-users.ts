import { prisma } from '../server/utils/prisma';
import bcrypt from 'bcryptjs';

async function checkCashierUsers() {
  console.log('Checking cashier users...');
  
  try {
    // Check existing users
    const users = await prisma.user.findMany({
      select: { id: true, login: true, name: true, role: true, active: true }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.login} (${u.name}) - ${u.role} - Active: ${u.active}`);
    });
    
    // Check if cashier user exists
    const cashierUser = users.find(u => u.role?.toLowerCase() === 'cashier' || u.role?.toLowerCase() === 'seller');
    
    if (!cashierUser) {
      console.log('Creating cashier user...');
      const hashedPassword = await bcrypt.hash('cashier', 10);
      
      const newCashier = await prisma.user.create({
        data: {
          login: 'cashier',
          password: hashedPassword,
          name: 'Cashier User',
          role: 'CASHIER',
          active: true
        }
      });
      
      console.log('Created cashier user:', newCashier.login);
      console.log('Cashier login credentials:');
      console.log('  Login: cashier');
      console.log('  Password: cashier');
    } else {
      console.log('Cashier user already exists:', cashierUser.login);
      console.log('Cashier login credentials:');
      console.log('  Login:', cashierUser.login);
      console.log('  Password: cashier');
    }
    
    return users;
    
  } catch (error) {
    console.error('Error checking cashier users:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

checkCashierUsers();
