// Helper functions to generate test data

export function generateProductData() {
  const timestamp = Date.now();
  return {
    name: `Test Product ${timestamp}`,
    price: Math.floor(Math.random() * 100000) + 10000,
    stock: Math.floor(Math.random() * 100) + 10,
    category: 'Test Category',
  };
}

export function generateCustomerData() {
  const timestamp = Date.now();
  return {
    name: `Test Customer ${timestamp}`,
    phone: `+99890${Math.floor(Math.random() * 10000000)}`,
    address: 'Test Address',
  };
}

export function generateSaleData() {
  return {
    quantity: Math.floor(Math.random() * 10) + 1,
    discount: Math.floor(Math.random() * 20),
  };
}

export function generateOrderData() {
  return {
    quantity: Math.floor(Math.random() * 20) + 5,
    deliveryAddress: 'Test Delivery Address',
    notes: 'Test order notes',
  };
}

export function generateRandomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomEmail(): string {
  return `test${Date.now()}@example.com`;
}

export function generateRandomPhone(): string {
  return `+99890${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}
