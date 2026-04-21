import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect, useState, Suspense, lazy } from 'react';
import './i18n';
import { LanguageProvider } from './contexts/LanguageContext';

// Lazy loading for better performance
const Login = lazy(() => import('./pages/Login'));
const CashierLogin = lazy(() => import('./pages/CashierLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/ProductsModern'));
const Sales = lazy(() => import('./pages/Sales'));
const Customers = lazy(() => import('./pages/CustomersModern'));
const Reports = lazy(() => import('./pages/ReportsModern'));
const Settings = lazy(() => import('./pages/Settings'));

// Core pages
import ProductDetail from './pages/ProductDetail';
import SimplifiedInventory from './pages/SimplifiedInventory';
import CustomerProfile from './pages/CustomerProfile';
import Orders from './pages/Orders';
import Cashbox from './pages/Cashbox';
import KomplektYigish from './pages/KomplektYigish';
const AddSale = lazy(() => import('./pages/AddSale'));
const CashierManagement = lazy(() => import('./pages/CashierManagement'));
const CashierShift = lazy(() => import('./pages/CashierShift'));
const CashierBot = lazy(() => import('./pages/CashierBot'));
const ModernChat = lazy(() => import('./pages/ModernChat'));
const Analytics = lazy(() => import('./components/ProfessionalCEOAnalytics'));

// Layouts
const ProfessionalLayout = lazy(() => import('./components/ProfessionalLayout'));
const CashierLayout = lazy(() => import('./layouts/CashierLayout'));

// Modern Loading component with enhanced design
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 bg-dots-pattern">
    <div className="glass-card p-10 rounded-3xl shadow-glass-lg animate-scale-in">
      <div className="relative">
        {/* Outer ring with shimmer effect */}
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 border-r-blue-400 shadow-glow"></div>
        
        {/* Middle ring - counter spin */}
        <div className="absolute top-1 left-1 animate-spin rounded-full h-18 w-18 border-3 border-indigo-100 border-b-indigo-500 border-l-indigo-300" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Inner animated gradient */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse shadow-glow"></div>
        </div>
        
        {/* Orbital dots */}
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-glow"></div>
        </div>
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-glow"></div>
        </div>
      </div>
      
      {/* Loading text with shimmer effect */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-gradient-blue animate-shimmer">Yuklanmoqda...</p>
        <p className="text-sm text-gray-500 mt-2">Iltimos, kuting</p>
      </div>
    </div>
  </div>
);

function App() {
  const { token: storeToken, user } = useAuthStore();
  const { theme } = useThemeStore();
  const [isRehydrated, setIsRehydrated] = useState(false);
  const [localToken, setLocalToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Rehydrate auth state from localStorage
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        if (parsed.state?.token) {
          setLocalToken(parsed.state.token);
        }
      } catch (e) {
        console.error('Failed to parse auth-storage:', e);
      }
    }
    setIsRehydrated(true);
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const token = storeToken || localToken;
  const isCashier = user?.role?.toUpperCase() === 'CASHIER' || user?.role?.toUpperCase() === 'SELLER';

  if (!isRehydrated) {
    return <LoadingSpinner />;
  }

  // Cashier routes
  if (window.location.pathname.startsWith('/cashier') || (token && isCashier)) {
    if (!token) {
      return (
        <LanguageProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/cashier/login" element={<CashierLogin />} />
                <Route path="*" element={<Navigate to="/cashier/login" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LanguageProvider>
      );
    }

    if (isCashier && !window.location.pathname.startsWith('/cashier')) {
      return (
        <LanguageProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="*" element={<Navigate to="/cashier/sales" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LanguageProvider>
      );
    }

    return (
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <CashierLayout>
              <Routes>
                <Route path="/cashier/sales" element={<Sales />} />
                <Route path="/cashier/sales/add" element={<AddSale />} />
                <Route path="/cashier/products" element={<Products />} />
                <Route path="/cashier/products/:id" element={<ProductDetail />} />
                <Route path="/cashier/inventory" element={<SimplifiedInventory />} />
                <Route path="/cashier/komplekt" element={<KomplektYigish />} />
                <Route path="/cashier/orders" element={<Orders />} />
                <Route path="/cashier/customers" element={<Customers />} />
                <Route path="/cashier/customers/:id" element={<CustomerProfile />} />
                <Route path="/cashier/cashbox" element={<Cashbox />} />
                <Route path="/cashier/shift" element={<CashierShift />} />
                <Route path="/cashier/bot" element={<CashierBot />} />
                <Route path="/cashier/chat" element={<ModernChat />} />
                <Route path="/cashier/expenses" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Xarajatlar</h2><p className="text-gray-500">Tez kunda...</p></div>} />
                <Route path="*" element={<Navigate to="/cashier/sales" />} />
              </Routes>
            </CashierLayout>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Public routes
  if (window.location.pathname === '/order' || 
      window.location.pathname === '/customer-portal' || 
      window.location.pathname === '/telegram-features') {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/order" element={<div className="min-h-screen flex items-center justify-center text-2xl">Public Order Page</div>} />
              <Route path="/customer-portal" element={<div className="min-h-screen flex items-center justify-center text-2xl">Customer Portal</div>} />
              <Route path="/telegram-features" element={<div className="min-h-screen flex items-center justify-center text-2xl">Telegram Features</div>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Auth required routes
  if (!token) {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Login />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <ProfessionalLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/inventory" element={<SimplifiedInventory />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/add" element={<AddSale />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerProfile />} />
              <Route path="/cashbox" element={<Cashbox />} />
              <Route path="/expenses" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Xarajatlar</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/cashiers" element={<CashierManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Analytics routes */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/revenue" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Revenue Calculator</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/activity" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Activity Monitor</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              
              {/* Management routes */}
              <Route path="/suppliers" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Suppliers</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/production" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Production</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/quality" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Quality Control</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/logistics" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Logistics</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              
              {/* Tools routes */}
              <Route path="/ai-assistant" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">AI Assistant</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/bots" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Bot Management</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/cloud-backup" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Cloud Backup</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              <Route path="/shortcuts" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Keyboard Shortcuts</h2><p className="text-gray-500">Tez kunda...</p></div>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ProfessionalLayout>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
