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
const AddSale = lazy(() => import('./pages/AddSale'));
const CashierManagement = lazy(() => import('./pages/CashierManagement'));

// Layouts
const ProfessionalLayout = lazy(() => import('./components/ProfessionalLayout'));
const CashierLayout = lazy(() => import('./layouts/CashierLayout'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
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
                <Route path="/cashier/orders" element={<Orders />} />
                <Route path="/cashier/customers" element={<Customers />} />
                <Route path="/cashier/customers/:id" element={<CustomerProfile />} />
                <Route path="/cashier/cashbox" element={<Cashbox />} />
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ProfessionalLayout>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
