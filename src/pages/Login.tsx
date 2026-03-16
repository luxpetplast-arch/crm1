import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kirish muvaffaqiyatsiz. Email yoki parol xato.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-card border border-border rounded-lg shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">AzizTrades ERP</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Parol"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-semibold text-blue-900 mb-2">Demo Login:</p>
          <p className="text-blue-800">Email: admin@aziztrades.com</p>
          <p className="text-blue-800">Parol: admin123</p>
        </div>
      </div>
    </div>
  );
}
