import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers');
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return { customers, loading, error, reload: loadCustomers };
}
