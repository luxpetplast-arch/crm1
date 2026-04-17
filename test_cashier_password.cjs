const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testCashierPassword() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { login: 'cashier1' },
      select: { id: true, name: true, login: true, role: true, active: true, password: true }
    });
    
    console.log('Cashier1 user found:', { 
      id: user.id, 
      name: user.name, 
      login: user.login, 
      role: user.role, 
      active: user.active 
    });
    
    // Common passwords to test
    const commonPasswords = ['123456', 'password', 'cashier1', '123', 'admin', 'cashier'];
    
    for (const testPassword of commonPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Password "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (isValid) {
        console.log(`✅ Correct password found: "${testPassword}"`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCashierPassword();
