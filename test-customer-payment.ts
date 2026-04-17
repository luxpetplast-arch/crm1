import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

let authToken = null;
let testCustomerId = null;

async function testCustomerPayment() {
  console.log('Testing Customer Payment Endpoint...\n');

  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await api.post('/auth/login', {
      email: 'test@zavod.uz',
      password: 'test123'
    });
    authToken = loginRes.data.token;
    api.defaults.headers.Authorization = `Bearer ${authToken}`;
    console.log('✅ Login successful\n');

    // 2. Create a test customer
    console.log('2. Creating test customer...');
    const customerRes = await api.post('/customers', {
      name: `Test Customer ${Date.now()}`,
      email: `test${Date.now()}@customer.uz`,
      phone: '+998901234567',
      category: 'NORMAL',
      debtUZS: 100000,
      debtUSD: 0,
      balanceUZS: 0,
      balanceUSD: 0
    });
    testCustomerId = customerRes.data.id;
    console.log(`✅ Customer created: ${testCustomerId}\n`);

    // 3. Make a payment
    console.log('3. Making payment...');
    try {
      const paymentRes = await api.post(`/customers/${testCustomerId}/payment`, {
        amount: 50000,
        currency: 'UZS',
        type: 'CASH',
        notes: 'Test payment'
      });
      console.log('✅ Payment successful!');
      console.log('Response:', JSON.stringify(paymentRes.data, null, 2));
    } catch (paymentError) {
      console.log('❌ Payment failed:');
      console.log('Status:', paymentError.response?.status);
      console.log('Error:', paymentError.response?.data || paymentError.message);
    }

    // 4. Get payments
    console.log('\n4. Getting customer payments...');
    try {
      const paymentsRes = await api.get(`/customers/${testCustomerId}/payments`);
      console.log('✅ Payments retrieved:');
      console.log(`Found ${paymentsRes.data.length} payments`);
    } catch (paymentsError) {
      console.log('❌ Failed to get payments:');
      console.log('Status:', paymentsError.response?.status);
    }

    // 5. Cleanup - delete test customer
    console.log('\n5. Cleaning up...');
    try {
      await api.delete(`/customers/${testCustomerId}`);
      console.log('✅ Test customer deleted');
    } catch (deleteError) {
      console.log('⚠️ Could not delete test customer:', deleteError.response?.status);
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.response?.data || '');
  }
}

testCustomerPayment();
