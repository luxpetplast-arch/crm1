import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  DollarSign, Moon, Sun, LogOut, FileText, 
  Settings as SettingsIcon, ChevronDown, ChevronUp,
  Factory, Package2, Truck, CheckSquare, ClipboardCheck,
  Bell, Shield, UserCog, Wallet, TrendingUp, Brain, Menu, X, Bot, MessageSquare
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
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const getNavigation = () => ({
  main: [
    { name: 'Bosh sahifa', href: '/', icon: LayoutDashboard },
    { name: 'Sotuvlar', href: '/sales', icon: ShoppingCart },
    { name: 'Buyurtmalar', href: '/orders', icon: Package },
    { name: 'Mahsulotlar', href: '/products', icon: Package },
    { name: 'Mijozlar', href: '/customers', icon: Users },
    { name: 'Kassa', href: '/cashbox', icon: Wallet },
    { name: 'Chat', href: '/customer-chat', icon: MessageSquare },
    { name: 'Mijoz Yozishmalari', href: '/customer-chats', icon: MessageSquare },
    { name: 'Moliya', href: '/expenses', icon: DollarSign },
    { name: 'Hisobotlar', href: '/reports', icon: FileText },
    { name: 'Sozlamalar', href: '/settings', icon: SettingsIcon },
  ],
  more: [
    { name: 'Statistika', href: '/statistics', icon: TrendingUp },
    { name: 'AI Tahlil', href: '/analytics', icon: Brain },
    { name: 'AI Manager', href: '/ai-manager', icon: Brain },
    { name: 'Super AI Manager', href: '/super-manager', icon: Brain },
    { name: 'AI Ombor', href: '/inventory-ai', icon: Package },
    { name: 'Bot Boshqaruvi', href: '/bots', icon: Bot, adminOnly: true },
    { name: 'Logistika', href: '/logistics', icon: Truck },
    { name: 'Haydovchilar', href: '/drivers', icon: Users, adminOnly: true },
    { name: 'Ishlab Chiqarish', href: '/production', icon: Factory },
    { name: 'Xom Ashyo', href: '/raw-materials', icon: Package2 },
    { name: 'Yetkazuvchilar', href: '/suppliers', icon: Truck },
    { name: 'Sifat Nazorati', href: '/quality-control', icon: CheckSquare },
    { name: 'Vazifalar', href: '/tasks', icon: ClipboardCheck },
    { name: 'Kassir Smenasi', href: '/cashier-shift', icon: Wallet },
    { name: 'Bildirishnomalar', href: '/notifications', icon: Bell },
    { name: 'Foydalanuvchilar', href: '/users', icon: UserCog, adminOnly: true },
    { name: 'Audit Log', href: '/audit-log', icon: Shield, adminOnly: true },
    { name: 'Prognoz', href: '/forecast', icon: TrendingUp },
  ]
});

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigation = getNavigation();
  const [showMore, setShowMore] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-40 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">AzizTrades ERP</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Main Navigation */}
            {navigation.main.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-110',
                    isActive && 'text-primary-foreground'
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {(item as any).badge && (
                    <span className="ml-auto px-2 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* More Menu Toggle */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {showMore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span className="font-medium">Boshqa</span>
            </button>

            {/* More Navigation (Collapsible) */}
            {showMore && (
              <div className="space-y-1 pl-2 border-l-2 border-border ml-4">
                {navigation.more.map((item) => {
                  if (item.adminOnly && user?.role !== 'ADMIN') return null;
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group text-sm',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4 transition-transform group-hover:scale-110',
                        isActive && 'text-primary-foreground'
                      )} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">{theme === 'light' ? 'Qorong\'i' : 'Yorug\''} Rejim</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <div className="flex-1 max-w-md ml-12 lg:ml-0">
              <GlobalSearch />
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationCenter />
              
              {/* User Menu */}
              <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Quick Actions Floating Button */}
      <QuickActions />

      {/* Inventory Alerts */}
      <InventoryAlerts />

      {/* Revenue Calculator */}
      <RevenueCalculator />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
