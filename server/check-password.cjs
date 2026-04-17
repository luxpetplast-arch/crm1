const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      select: { id: true, name: true, password: true }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User:', user.name);
    console.log('Password hash:', user.password);
    
    // Check common passwords
    const passwords = ['admin123', 'password', '123456', 'test'];
    for (const pwd of passwords) {
      const valid = await bcrypt.compare(pwd, user.password);
      if (valid) {
        console.log(`Correct password is: ${pwd}`);
        return;
      }
    }
    
    console.log('No common password matched');
  } catch (error) {
    console.error('Error checking password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
