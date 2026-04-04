const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:');
    console.log(JSON.stringify(users.map(u => ({ 
      id: u.id, 
      name: u.name, 
      email: u.email, 
      login: u.login,
      role: u.role, 
      active: u.active 
    })), null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
