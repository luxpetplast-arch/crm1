import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  DollarSign, Moon, Sun, LogOut, FileText, 
  Settings as SettingsIcon, ChevronDown, ChevronUp,
  Factory, Package2, Truck, CheckSquare,
  Wallet, Brain, Menu, X, Bot,
  BarChart3, Activity, Zap, Cloud, Shield
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { latinToCyrillic } from '../lib/transliterator';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  cashierRestricted?: boolean;
  badge?: string | number;
  category?: 'main' | 'analytics' | 'management' | 'tools';
}

const getNavigation = (): { main: NavigationItem[]; analytics: NavigationItem[]; management: NavigationItem[]; tools: NavigationItem[] } => ({
  main: [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'main' },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, category: 'main' },
    { name: 'Orders', href: '/orders', icon: Package, category: 'main' },
    { name: 'Products', href: '/products', icon: Package, category: 'main' },
    { name: 'Customers', href: '/customers', icon: Users, category: 'main' },
    { name: 'Cashbox', href: '/cashbox', icon: Wallet, category: 'main' },
    { name: 'Cashier Management', href: '/cashiers', icon: Shield, adminOnly: true, category: 'main' },
    { name: 'Reports', href: '/reports', icon: FileText, category: 'main' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, category: 'main' },
  ],
  analytics: [
    { name: 'Analytics', href: '/analytics', icon: BarChart3, category: 'analytics' },
    { name: 'Revenue Calculator', href: '/revenue', icon: DollarSign, category: 'analytics' },
    { name: 'Activity Monitor', href: '/activity', icon: Activity, category: 'analytics' },
  ],
  management: [
    { name: 'Inventory', href: '/inventory', icon: Package2, category: 'management' },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, category: 'management' },
    { name: 'Production', href: '/production', icon: Factory, category: 'management' },
    { name: 'Quality Control', href: '/quality', icon: CheckSquare, category: 'management' },
    { name: 'Logistics', href: '/logistics', icon: Truck, category: 'management' },
  ],
  tools: [
    { name: 'AI Assistant', href: '/ai-assistant', icon: Brain, category: 'tools' },
    { name: 'Bot Management', href: '/bots', icon: Bot, category: 'tools' },
    { name: 'Cloud Backup', href: '/cloud-backup', icon: Cloud, category: 'tools' },
    { name: 'Keyboard Shortcuts', href: '/shortcuts', icon: Zap, category: 'tools' },
  ],
});

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['main', 'management']));
    
  const sidebarRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts({
    'Ctrl+B': () => setIsSidebarOpen(!isSidebarOpen),
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const navigation = getNavigation();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isCashier = user?.role?.toUpperCase() === 'CASHIER' || user?.role?.toUpperCase() === 'SELLER';

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.href || 
                   (item.href !== '/' && location.pathname.startsWith(item.href));
    
    if (item.adminOnly && !isAdmin) return null;
    if (item.cashierRestricted && isCashier) return null;

    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
          "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isActive 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
            : "text-gray-600"
        )}
      >
        <item.icon className={cn(
          "w-5 h-5 transition-transform duration-300",
          "group-hover:scale-110",
          isActive && "text-white"
        )} />
        <span className="font-medium">{latinToCyrillic(item.name)}</span>
        {item.badge && (
          <span className={cn(
            "ml-auto px-2 py-1 text-xs font-bold rounded-full",
            isActive 
              ? "bg-white/20 text-white" 
              : "bg-blue-100 text-blue-700"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderNavigationCategory = (category: string, items: NavigationItem[]) => {
    const isExpanded = expandedCategories.has(category);
    const hasActiveItem = items.some(item => 
      location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href))
    );

    return (
      <div key={category} className="mb-2">
        <button
          onClick={() => toggleCategory(category)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            hasActiveItem && "bg-blue-50 text-blue-700"
          )}
        >
          <span className="font-semibold text-sm uppercase tracking-wider">
            {latinToCyrillic(category)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1 animate-slide-in">
            {items.map(renderNavigationItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl z-50 transition-all duration-300",
          isSidebarOpen ? "w-56" : "w-12",
          isMobile && !isSidebarOpen && "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {Object.entries(navigation).map(([category, items]) => 
            renderNavigationCategory(category, items)
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
              {isSidebarOpen && (
                <span className="font-medium">{latinToCyrillic("Mavzu")}</span>
              )}
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && (
                <span className="font-medium">{latinToCyrillic("Chiqish")}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "ml-56" : "ml-12",
        isMobile && "ml-0"
      )}>
        
        {/* Page Content */}
        <main className="p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
