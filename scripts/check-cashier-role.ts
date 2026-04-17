import axios from 'axios';

async function checkCashierRole() {
  console.log('Checking cashier role and permissions...');
  
  try {
    // Login as cashier
    const loginResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('Login successful!');
    console.log('User role:', user.role);
    console.log('User role type:', typeof user.role);
    console.log('User role uppercase:', user.role?.toUpperCase());
    
    // Test if role matches required permissions
    const requiredRoles = ['ADMIN', 'CASHIER', 'SELLER'];
    const hasPermission = requiredRoles.some(role => role.toUpperCase() === user.role?.toUpperCase());
    
    console.log('Required roles:', requiredRoles);
    console.log('Has permission:', hasPermission);
    
    // Test sales creation with detailed error
    console.log('\nTesting sales creation...');
    
    // Get test data
    const productsResponse = await axios.get('http://localhost:3001/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const customersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (productsResponse.data.length > 0 && customersResponse.data.length > 0) {
      const saleData = {
        customerId: customersResponse.data[0].id,
        items: [
          {
            productId: productsResponse.data[0].id,
            quantity: 1,
            unitPrice: 1000,
            totalPrice: 1000
          }
        ],
        paymentMethod: 'CASH',
        totalAmount: 1000,
        notes: 'Test sale'
      };
      
      try {
        const saleResponse = await axios.post('http://localhost:3001/api/sales', saleData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('SUCCESS: Sale created with ID:', saleResponse.data.id);
        
        // Clean up
        await axios.delete(`http://localhost:3001/api/sales/${saleResponse.data.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Test sale cleaned up');
        
      } catch (error: any) {
        console.log('ERROR:', error.response?.status);
        console.log('ERROR MESSAGE:', error.response?.data?.error);
        console.log('FULL ERROR:', error.response?.data);
        
        // Check if it's really a permission issue
        if (error.response?.status === 403) {
          console.log('\nThis is a permission issue. Checking role comparison...');
          console.log('User role:', user.role);
          console.log('Expected: CASHIER');
          console.log('Match:', user.role?.toUpperCase() === 'CASHIER');
        }
      }
    }
    
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

checkCashierRole();
