import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function CustomersSimple() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError('Mijozlarni yuklashda xatolik: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Mijozlar</h1>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Mijozlar</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={loadCustomers}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mijozlar</h1>
      
      <div className="mb-4">
        <p className="text-gray-600">Jami mijozlar: {customers.length}</p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Mijozlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-gray-600">📞 {customer.phone}</p>
              {customer.email && <p className="text-gray-600">📧 {customer.email}</p>}
              <p className="text-gray-600">🏷️ {customer.category}</p>
              <p className="text-gray-600">💰 Qarz: ${customer.debt || 0}</p>
              <p className="text-gray-600">💳 Balance: ${customer.balance || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
