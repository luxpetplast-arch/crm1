import { prisma } from '../server/utils/prisma';
import bcrypt from 'bcrypt';

async function checkAuthCredentials() {
  console.log('=== Authentication Credentials Check ===');
  
  try {
    // Check admin user
    console.log('1. Checking admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { login: 'admin@aziztrades.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.login);
      console.log('Password hash:', adminUser.password);
      
      // Test password
      const passwordMatch = await bcrypt.compare('admin123', adminUser.password);
      console.log('Password match:', passwordMatch);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Check cashier user
    console.log('2. Checking cashier user...');
    const cashierUser = await prisma.user.findFirst({
      where: { login: 'cashier' }
    });
    
    if (cashierUser) {
      console.log('✅ Cashier user found:', cashierUser.login);
      console.log('Password hash:', cashierUser.password);
      
      // Test password
      const cashierPasswordMatch = await bcrypt.compare('cashier', cashierUser.password);
      console.log('Cashier password match:', cashierPasswordMatch);
    } else {
      console.log('❌ Cashier user not found');
    }
    
    // List all users
    console.log('3. Listing all users...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        login: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Login: ${user.login}, Role: ${user.role}, Active: ${user.active}`);
    });
    
    console.log('\n=== Authentication Check Complete ===');
    
  } catch (error) {
    console.error('Error checking credentials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthCredentials();
