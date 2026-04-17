const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        login: true,
        role: true,
        active: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email || u.login}) - Role: ${u.role} - Active: ${u.active}`);
    });
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
