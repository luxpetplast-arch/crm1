import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Factory, ShieldCheck, Banknote, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'admin' | 'cashier'>('admin');
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let endpoint = '/auth/login';
      let requestData: any = {};
      
      if (loginType === 'admin') {
        endpoint = '/auth/login';
        requestData = { login, password };
      } else {
        endpoint = '/auth/cashier-login';
        requestData = { login, password };
      }
      
      const { data } = await api.post(endpoint, requestData);
      
      // MUHIM: State'ni yangilashdan oldin datani tekshirish
      if (!data.token || !data.user) {
        throw new Error('Serverdan noto\'g\'ri ma\'lumot keldi');
      }

      setAuth(data.token, data.user);
      
      // Roli bo'yicha yo'naltirish - Kichik/katta harflarni hisobga olish
      const role = data.user.role?.toUpperCase();
      if (role === 'CASHIER' || role === 'SELLER') {
        // LocalStorage'ga yozilganini kutish va yo'naltirish
        setTimeout(() => {
          navigate('/cashier/sales');
          window.location.reload(); // State to'liq yangilanishi uchun
        }, 100);
      } else {
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 100);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Кириш муваффақиятсиз. Логин ёки парол хато.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-gray-800 overflow-hidden">
          {/* Top Decorative bar */}
          <div className={`h-2 w-full transition-colors duration-500 ${loginType === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>
          
          <div className="p-8 sm:p-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 rotate-3 ${
                loginType === 'admin' 
                  ? 'bg-blue-600 shadow-blue-500/20' 
                  : 'bg-emerald-600 shadow-emerald-500/20'
              }`}>
                <Factory className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter text-center">
                LUX PET <span className="text-blue-600">PLAST</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Zavod Boshqaruv Tizimi
                </p>
              </div>
            </div>
            
            {/* Role Selector - Segmented Control */}
            <div className="mb-8 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl flex relative">
              <div 
                className={`absolute inset-y-1.5 transition-all duration-300 rounded-xl shadow-lg ${
                  loginType === 'admin' 
                    ? 'left-1.5 w-[calc(50%-0.375rem)] bg-blue-600' 
                    : 'left-[calc(50%+0.1875rem)] w-[calc(50%-0.375rem)] bg-emerald-600'
                }`}
              />
              <button
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-sm z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'admin' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                ADMIN
              </button>
              <button
                onClick={() => setLoginType('cashier')}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-sm z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'cashier' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                KASSIR
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 animate-shake">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">!</div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400 leading-tight">{error}</p>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Логин"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder={loginType === 'admin' ? 'admin' : 'kassir'}
                required
                className="rounded-2xl"
              />
              
              <Input
                label="Парол"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-2xl"
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className={`w-full font-black tracking-tight rounded-2xl transition-all duration-500 shadow-2xl ${
                    loginType === 'admin' 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>KIRILMOQDA...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      TIZIMGA KIRISH
                    </span>
                  )}
                </Button>
              </div>
            </form>
            
            {/* Footer Links */}
            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                © 2024 LUX PET PLAST. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
