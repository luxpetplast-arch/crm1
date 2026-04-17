import { prisma } from '../server/utils/prisma';
import bcrypt from 'bcryptjs';

async function checkAndCreateUser() {
  console.log('Checking and creating admin user...');
  
  try {
    // Check existing users
    const users = await prisma.user.findMany({
      select: { id: true, login: true, name: true, role: true, active: true }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.login} (${u.name}) - ${u.role} - Active: ${u.active}`);
    });
    
    // Check if admin user exists
    const adminUser = users.find(u => u.login === 'admin');
    
    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          login: 'admin',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          active: true
        }
      });
      
      console.log('Created admin user:', newAdmin.login);
      console.log('Login credentials:');
      console.log('  Login: admin');
      console.log('  Password: admin');
    } else {
      console.log('Admin user already exists');
      console.log('Login credentials:');
      console.log('  Login: admin');
      console.log('  Password: admin');
    }
    
    return users;
    
  } catch (error) {
    console.error('Error checking/creating user:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUser();
