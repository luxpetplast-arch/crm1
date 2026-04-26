import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  DollarSign, Moon, Sun, LogOut, FileText, 
  Settings as SettingsIcon, ChevronDown, ChevronUp,
  Factory, Package2, Truck, CheckSquare, ClipboardCheck,
  Bell, Shield, UserCog, Wallet, TrendingUp, Brain, Menu, X, Bot, MessageSquare, Sparkles,
  BarChart3, Sunrise, Sunset
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
    { name: 'Мижоз Хабарлари', href: '/customer-chats', icon: MessageSquare },
    { name: 'Молия', href: '/expenses', icon: DollarSign },
    { name: 'Ҳисоботлар', href: '/reports', icon: FileText },
    { name: 'Созламалар', href: '/settings', icon: SettingsIcon },
  ],
  more: [
    { name: 'Кунлик Ҳисботлар', href: '/reports/daily', icon: BarChart3, cashierRestricted: true },
    { name: 'Статистика', href: '/statistics', icon: TrendingUp, cashierRestricted: true },
    { name: 'AI Таҳлил', href: '/analytics', icon: Brain, cashierRestricted: true },
    { name: 'AI Manager', href: '/ai-manager', icon: Brain, cashierRestricted: true },
    { name: 'Бизнес AI', href: '/business-ai', icon: Sparkles, cashierRestricted: true },
    { name: 'Super AI Manager', href: '/super-manager', icon: Brain, cashierRestricted: true },
    { name: 'AI Омбор', href: '/inventory-ai', icon: Package, cashierRestricted: true },
    { name: 'Бот Бошқаруви', href: '/bots', icon: Bot, adminOnly: true },
    { name: 'Кассир Боти', href: '/cashier-bot', icon: Bot },
    { name: 'Логистика', href: '/logistics', icon: Truck },
    { name: 'Ишлаб чиқариш', href: '/production', icon: Factory },
    { name: 'Хом Ашё', href: '/raw-materials', icon: Package2 },
    { name: 'Таъминловчилар', href: '/suppliers', icon: Truck },
    { name: 'Сифат Назорати', href: '/quality-control', icon: CheckSquare },
    { name: 'Вазифалар', href: '/tasks', icon: ClipboardCheck },
    { name: 'Кассир Сменаси', href: '/cashier-shift', icon: Wallet },
    { name: 'Билдиришномалар', href: '/notifications', icon: Bell },
    { name: 'Фойдаланувчилар', href: '/users', icon: UserCog, adminOnly: true },
    { name: 'Аудит Журнали', href: '/audit-log', icon: Shield, adminOnly: true },
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

      {/* Sidebar - Login Page Style Glassmorphism */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-4 left-4 w-[260px] login-card backdrop-blur-[40px] z-[90] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section - Professional & Compact */}
        <div className="p-5 shrink-0">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 rotate-2 group-hover:rotate-6 transition-all duration-500">
                <Factory className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                LUX <span className="text-blue-600">PET</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                  ЗАВОД ТИЗИМИ
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Compact List Style */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide py-2">
          <div className="space-y-0.5">
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                  )} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-3 py-1.5 bg-rose-500 text-white text-xs rounded-lg font-black animate-bounce shadow-lg shadow-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* More Toggle - KATTA */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-between px-8 py-6 w-full rounded-[1.5rem] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-500 group mt-8 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-5">
              <ChevronDown className={cn("w-6 h-6 transition-transform duration-500", showMore ? "rotate-180" : "")} />
              <span className="font-bold text-sm uppercase tracking-[0.25em]">{latinToCyrillic("Бошқа")}</span>
            </div>
          </button>

          {showMore && (
            <div className="space-y-2 pl-4 py-6 animate-in slide-in-from-top-4 duration-700 grid grid-cols-1 gap-1">
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
                      'flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-500 group text-xs font-bold uppercase tracking-[0.1em]',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 border border-transparent'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 transition-transform duration-500 group-hover:scale-110',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Profile - Compact Card */}
        <div className="p-3 shrink-0">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Администратор'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-medium text-xs hover:bg-rose-600 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{latinToCyrillic("Чиқиш")}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Login Page Style */}
      <main className="flex-1 lg:ml-[280px] relative z-10 p-4 min-h-screen">
        <div className="w-full h-full login-card flex flex-col">
          {/* Top Header - Login Page Style */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-full md:w-auto md:flex-1 max-w-2xl">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-4">
              <QuickActions />
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
              <InventoryAlerts />
              <NotificationCenter />
              <LanguageToggle />
              <button
                onClick={toggleTheme}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="flex-1 p-6 overflow-auto">
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
