const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetCashierPassword() {
  try {
    const newPassword = '123456'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { login: 'cashier1' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset successfully for cashier1');
    console.log('New password: "123456"');
    console.log('Updated user:', {
      id: updatedUser.id,
      name: updatedUser.name,
      login: updatedUser.login,
      role: updatedUser.role,
      active: updatedUser.active
    });
    
    // Test the new password
    const isValid = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetCashierPassword();
