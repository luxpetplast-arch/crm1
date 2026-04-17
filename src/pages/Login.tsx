import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/professionalApi';
import { 
  Factory, 
  ShieldCheck, 
  Banknote, 
  Eye, 
  EyeOff,
  ArrowRight,
  Lock,
  User,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'admin' | 'cashier'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      
      console.log('🔐 Login attempt:', { endpoint, requestData, loginType });
      const { data } = await api.post(endpoint, requestData);
      console.log('✅ Login response:', data);
      
      if (!data.token || !data.user) {
        throw new Error('Serverdan noto\'g\'ri ma\'lumot keldi');
      }

      setAuth(data.token, data.user);
      
      const role = data.user.role?.toUpperCase();
      if (role === 'CASHIER' || role === 'SELLER') {
        navigate('/cashier/sales');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Кириш муваффақиятсиз. Фойдаланувчи номи ёки парол хато.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      <div className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Main Card - Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 border border-white/50 overflow-hidden">
          <div className="p-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
                <Factory className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
                LUX PET PLAST
              </h1>
              <p className="text-sm text-gray-500">Завод Бошқарув Тизими</p>
            </div>
            
            {/* Login Type Toggle - Modern Design */}
            <div className="mb-6">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => setLoginType('admin')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    loginType === 'admin' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Админ</span>
                </button>
                <button 
                  onClick={() => setLoginType('cashier')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    loginType === 'cashier' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Кассир</span>
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Login Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Фойдаланувчи номи"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 hover:border-slate-300"
                />
              </div>
              
              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Парол"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors duration-300 p-1 rounded-lg hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Тизимга киришмоқда...</span>
                  </>
                ) : (
                  <>
                    <span>Тизимга кириш</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            
            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Сервер Онлайн</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>v2.0</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom text */}
        <p className="text-center text-sm text-white/70 mt-6">
          © 2025 LUX PET PLAST. Барча хуқуқлар ҳимояланган.
        </p>
      </div>
    </div>
  );
}
