import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  DollarSign, Moon, Sun, LogOut, FileText, 
  Settings as SettingsIcon, ChevronDown, ChevronUp,
  Factory, Package2, Truck, CheckSquare, ClipboardCheck,
  Bell, Shield, UserCog, Wallet, TrendingUp, Brain, Menu, X, Bot, MessageSquare, Sparkles
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import QuickActions from './QuickActions';
import InventoryAlerts from './InventoryAlerts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import RevenueCalculator from './RevenueCalculator';
import LanguageToggle from './LanguageToggle';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { latinToCyrillic } from '../lib/transliterator';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  cashierRestricted?: boolean;
  badge?: string | number;
}

const getNavigation = (): { main: NavigationItem[]; more: NavigationItem[] } => ({
  main: [
    { name: 'Бош саҳифа', href: '/', icon: LayoutDashboard },
    { name: 'Сотувлар', href: '/sales', icon: ShoppingCart },
    { name: 'Буюртмалар', href: '/orders', icon: Package },
    { name: 'Маҳсулотлар', href: '/products', icon: Package },
    { name: 'Мижозлар', href: '/customers', icon: Users },
    { name: 'Ҳайдовчилар', href: '/drivers', icon: Users },
    { name: 'Касса', href: '/cashbox', icon: Wallet },
    { name: 'Чат', href: '/customer-chat', icon: MessageSquare },
    { name: 'Мижоз ёзишмаlari', href: '/customer-chats', icon: MessageSquare },
    { name: 'Молия', href: '/expenses', icon: DollarSign },
    { name: 'Ҳисоботлар', href: '/reports', icon: FileText },
    { name: 'Созламалар', href: '/settings', icon: SettingsIcon },
  ],
  more: [
    { name: 'Статистика', href: '/statistics', icon: TrendingUp, cashierRestricted: true },
    { name: 'AI Таҳлил', href: '/analytics', icon: Brain, cashierRestricted: true },
    { name: 'AI Manager', href: '/ai-manager', icon: Brain, cashierRestricted: true },
    { name: 'Biznes AI', href: '/business-ai', icon: Sparkles, cashierRestricted: true },
    { name: 'Super AI Manager', href: '/super-manager', icon: Brain, cashierRestricted: true },
    { name: 'AI Омбор', href: '/inventory-ai', icon: Package, cashierRestricted: true },
    { name: 'Бот Бошқаруви', href: '/bots', icon: Bot, adminOnly: true },
    { name: 'Кассир Боти', href: '/cashier-bot', icon: Bot },
    { name: 'Логистика', href: '/logistics', icon: Truck },
    { name: 'Ишлаб чиқариш', href: '/production', icon: Factory },
    { name: 'Хом Ашё', href: '/raw-materials', icon: Package2 },
    { name: 'Ятказувчилар', href: '/suppliers', icon: Truck },
    { name: 'Сифат Назорати', href: '/quality-control', icon: CheckSquare },
    { name: 'Вазифалар', href: '/tasks', icon: ClipboardCheck },
    { name: 'Кассир Сменаси', href: '/cashier-shift', icon: Wallet },
    { name: 'Билдиришномалар', href: '/notifications', icon: Bell },
    { name: 'Фойдаланувчилар', href: '/users', icon: UserCog, adminOnly: true },
    { name: 'Audit Log', href: '/audit-log', icon: Shield, adminOnly: true },
    { name: 'Прогноз', href: '/forecast', icon: TrendingUp, cashierRestricted: true },
  ]
});

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigation = getNavigation();
  const [showMore, setShowMore] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const hasRedirected = useRef(false);
  
  // Kassir tekshiruvi - agar kassir bo'lsa /cashier/sales ga yo'naltirish
  useEffect(() => {
    if (user && !hasRedirected.current) {
      const role = user.role;
      if (role === 'CASHIER' || role === 'SELLER' || role === 'cashier' || role === 'seller') {
        // Kassirlar faqat /cashier/* yo'llaridan foydalanishi mumkin
        if (!location.pathname.startsWith('/cashier')) {
          hasRedirected.current = true;
          navigate('/cashier/sales');
        }
      }
    }
  }, [user, location.pathname, navigate]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen !bg-[#f8fafc] dark:!bg-gray-950 relative overflow-hidden flex font-sans selection:bg-blue-500/30 transition-colors duration-700">
      {/* Background elements for Ultra Premium feel - Consistent with Login page */}
      <div className="fixed top-0 -left-20 w-[50rem] h-[50rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob pointer-events-none opacity-60 dark:opacity-20 transition-all duration-1000"></div>
      <div className="fixed -bottom-20 -right-20 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none opacity-60 dark:opacity-20 transition-all duration-1000"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-emerald-500/5 rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 pointer-events-none opacity-40 dark:opacity-10 transition-all duration-1000"></div>

      {/* Mobile Menu Button - Enhanced Floating Design */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-[100] w-16 h-16 bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white dark:border-gray-800 rounded-full flex items-center justify-center transition-all active:scale-90 group overflow-hidden"
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-700 transition-opacity duration-500",
          mobileMenuOpen ? "opacity-100" : "opacity-0"
        )}></div>
        <div className="relative z-10">
          {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />}
        </div>
      </button>

      {/* Sidebar - Ultra Modern Glassmorphism */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 w-[340px] bg-white/70 dark:bg-gray-950/70 backdrop-blur-[60px] border-r border-white/20 dark:border-gray-800/20 z-[90] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_80px_rgba(0,0,0,0.03)] flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section - Professional & Strong */}
        <div className="p-12 shrink-0">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-12 transition-all duration-700">
                <Factory className="w-9 h-9" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none group-hover:tracking-tight transition-all duration-500">
                LUX <span className="text-blue-600">PET</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">
                  ZAVOD TIZIMI
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Premium List Style */}
        <nav className="flex-1 px-8 space-y-2 overflow-y-auto scrollbar-hide py-4 custom-sidebar-nav">
          <div className="space-y-1.5">
            {navigation.main.map((item) => {
              if (item.adminOnly && user?.role?.toUpperCase() !== 'ADMIN') return null;
              if (item.cashierRestricted && user?.role?.toUpperCase() === 'CASHIER') return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden',
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)] scale-[1.02] border border-blue-500/50'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none border border-transparent hover:border-gray-100 dark:hover:border-gray-800'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 transition-all duration-700 group-hover:scale-125 group-hover:rotate-6',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                  )} />
                  <span className="font-black text-[11px] uppercase tracking-[0.15em]">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2.5 py-1 bg-rose-500 text-white text-[9px] rounded-lg font-black animate-bounce shadow-lg shadow-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* More Toggle */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-between px-8 py-6 w-full rounded-[1.5rem] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-500 group mt-6 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", showMore ? "rotate-180" : "")} />
              <span className="font-black text-[10px] uppercase tracking-[0.25em]">{latinToCyrillic("Boshqa")}</span>
            </div>
          </button>

          {showMore && (
            <div className="space-y-1.5 pl-4 py-6 animate-in slide-in-from-top-4 duration-700 grid grid-cols-1 gap-1">
              {navigation.more.map((item) => {
                if (item.adminOnly && user?.role?.toUpperCase() !== 'ADMIN') return null;
                if (item.cashierRestricted && user?.role?.toUpperCase() === 'CASHIER') return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-500 group text-[10px] font-black uppercase tracking-[0.1em]',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 border border-transparent'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 transition-transform duration-500 group-hover:scale-110',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Profile - Login Page Style Card */}
        <div className="p-8 shrink-0">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-gray-900 shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800 group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:rotate-6 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-70">
                  {user?.role || 'Administrator'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-3.5 flex items-center justify-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-500 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>TIZIMDAN CHIQISH</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[340px] relative z-10 p-0 min-h-screen w-full">
        <div className="w-full space-y-10">
          {/* Top Header - Glassmorphism Floating */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white/40 dark:bg-gray-950/40 backdrop-blur-2xl border border-white/40 dark:border-gray-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <div className="w-full md:w-auto md:flex-1 max-w-2xl">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
              <QuickActions />
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2 hidden sm:block"></div>
              <InventoryAlerts />
              <NotificationCenter />
              <LanguageToggle />
              <button
                onClick={toggleTheme}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-all active:scale-90"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Dynamic Content with Page Transitions */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 cubic-bezier(0.4, 0, 0.2, 1)">
            {children}
          </div>
        </div>
      </main>

      {/* Floating Widgets */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 items-end pointer-events-none">
        <div className="pointer-events-auto">
          <RevenueCalculator />
        </div>
        <div className="pointer-events-auto">
          <KeyboardShortcutsHelp />
        </div>
      </div>
    </div>
  );
}
