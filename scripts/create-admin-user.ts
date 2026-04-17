import { prisma } from '../server/utils/prisma';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  console.log('=== Creating Admin User ===');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { login: 'admin@aziztrades.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Login:', existingAdmin.login);
      console.log('Role:', existingAdmin.role);
      console.log('Active:', existingAdmin.active);
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        login: 'admin@aziztrades.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        active: true
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('ID:', newAdmin.id);
    console.log('Login:', newAdmin.login);
    console.log('Role:', newAdmin.role);
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
