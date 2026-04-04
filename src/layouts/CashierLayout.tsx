import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Calculator, LogOut, User, Users, Bot, ClipboardList, Plus, Factory, Menu, X, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const CashierLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setAuth(null, null);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/cashier/sales', icon: ShoppingCart, label: 'Sotuv', color: 'bg-emerald-500' },
    { path: '/cashier/inventory', icon: Package, label: 'Ombor', color: 'bg-blue-500' },
    { path: '/cashier/customers', icon: Users, label: 'Mijozlar', color: 'bg-purple-500' },
    { path: '/cashier/drivers', icon: Truck, label: 'Haydovchilar', color: 'bg-rose-500' },
    { path: '/cashier/cashbox', icon: Calculator, label: 'Kassa', color: 'bg-orange-500' },
    { path: '/cashier/orders', icon: ClipboardList, label: 'Buyurtma', color: 'bg-indigo-500' },
  ];
  
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Premium Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-slate-200 dark:border-slate-800" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center h-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 rotate-3">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">LUX <span className="text-emerald-600">CASHIER</span></h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">System Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-black tracking-tight">{user?.name}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Kassir</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Premium Bottom Navigation - More iOS like */}
      <nav className="fixed bottom-6 left-4 right-6 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl px-2 py-2">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-500 group flex-1",
                    active ? "scale-110" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 mb-1",
                    active ? cn(item.color, "text-white shadow-lg shadow-current/30 rotate-3") : "bg-transparent text-slate-600 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                    active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  )}>
                    {item.label}
                  </span>
                  {active && (
                    <div className={cn("absolute -bottom-1 w-1 h-1 rounded-full", item.color.replace('bg-', 'text-'))} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Floating Action Button - Quick Add Sale */}
        {isActive('/cashier/sales') === false && (
          <button
            onClick={() => navigate('/cashier/sales')}
            className="fixed right-6 bottom-28 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
          >
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default CashierLayout; 
 
