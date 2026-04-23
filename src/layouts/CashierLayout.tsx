import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Calculator, LogOut, User, Users, ClipboardList, Plus, Clock, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const CashierLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/cashier/sales', icon: ShoppingCart, label: 'Sotuv', color: 'bg-emerald-500' },
    { path: '/cashier/inventory', icon: Package, label: 'Ombor', color: 'bg-blue-500' },
    { path: '/cashier/customers', icon: Users, label: 'Mijozlar', color: 'bg-purple-500' },
    { path: '/cashier/cashbox', icon: Calculator, label: 'Kassa', color: 'bg-orange-500' },
    { path: '/cashier/orders', icon: ClipboardList, label: 'Buyurtma', color: 'bg-indigo-500' },
    { path: '/cashier/shift', icon: Clock, label: 'Smena', color: 'bg-cyan-500' },
    { path: '/cashier/bot', icon: MessageCircle, label: 'Bot', color: 'bg-pink-500' },
    { path: '/cashier/chat', icon: MessageCircle, label: 'Chat', color: 'bg-green-500' },
  ];
  
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Premium Header - KICHIK */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl border-b border-slate-200 dark:border-slate-800" : "bg-gradient-to-b from-white to-white/80 dark:from-gray-900 dark:to-gray-900/80"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
          {/* Chap tomon - Logo va kompaniya nomi */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white/60 overflow-hidden bg-white"
              style={{
                backgroundImage: 'url("/logo.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
              title="LUX PET PLAST"
            ></div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black tracking-tighter leading-tight">
                <span className="text-emerald-600">LUX PET PLAST</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                BUXORO VILOYATI VOBKENT TUMANI
              </p>
            </div>
          </div>
          
          {/* O'ng tomon - Kassir ma'lumotlari */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold">{user?.name}</span>
              <span className="text-xs text-emerald-600 font-medium">Kassir</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Premium Bottom Navigation - More iOS like - KATTA */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] px-2 sm:px-4 py-3 w-full">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-2 transition-all duration-500 group flex-1",
                    active ? "scale-105" : "opacity-70 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                    active ? cn(item.color, "text-white shadow-lg") : "bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wide mt-2",
                    active ? "text-slate-900 dark:text-white" : "text-slate-500"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content - KICHIK */}
      <main className="pt-20 pb-28 px-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Floating Action Button - Quick Add Sale - KATTA */}
        {isActive('/cashier/sales') === false && (
          <button
            onClick={() => navigate('/cashier/sales')}
            className="fixed right-8 bottom-32 w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default CashierLayout; 
 
