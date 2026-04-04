import axios from 'axios';

async function testProductsWithAuth() {
  try {
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Token received:', !!token);
    
    try {
      const productsResponse = await axios.get('http://localhost:5001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Products count:', productsResponse.data.length);
      if (productsResponse.data.length > 0) {
        console.log('First product:', {
          id: productsResponse.data[0].id,
          name: productsResponse.data[0].name,
          pricePerBag: productsResponse.data[0].pricePerBag,
          currentStock: productsResponse.data[0].currentStock
        });
      }
    } catch (error) {
      console.log('Products API error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('Login failed:', error.response?.data || error.message);
  }
}

testProductsWithAuth();
