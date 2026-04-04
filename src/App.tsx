import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import './i18n'; // i18n konfiguratsiyasini yuklash
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import RawMaterials from './pages/RawMaterials';
import Suppliers from './pages/Suppliers';
import Production from './pages/Production';
import QualityControl from './pages/QualityControl';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import CustomerPortalPage from './pages/CustomerPortalPage';
import RealTelegramFeaturesPage from './pages/RealTelegramFeaturesPage';
import Expenses from './pages/Expenses';
import Forecast from './pages/Forecast';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import AuditLog from './pages/AuditLog';
import CashierShift from './pages/CashierShift';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Statistics from './pages/Statistics';
import AIManager from './pages/AIManager';
import BusinessAI from './pages/BusinessAI';
import Cashbox from './pages/Cashbox';
import Orders from './pages/Orders';
import InventoryAI from './pages/InventoryAI';
import Logistics from './pages/Logistics';
import SuperManager from './pages/SuperManager';
import PublicOrder from './pages/PublicOrder';
import { Drivers } from './pages/Drivers';
import BotManagement from './pages/BotManagement';
import { CustomerChat } from './pages/CustomerChat';
import CustomerChats from './pages/CustomerChats';
import CashierBot from './pages/CashierBot';
import AddProduct from './pages/AddProduct';
import CashierAddStock from './pages/CashierAddStock';
import ProductsGrouped from './pages/Products-Grouped';
import SalesGrouped from './pages/Sales-Grouped';
import AddSale from './pages/AddSale';
import DebugCharts from './pages/DebugCharts';
import Layout from './components/Layout';
import Debtors from './pages/Debtors';
import CashierLayout from './layouts/CashierLayout';

function App() {
  const { token, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Dark mode ni o'chirish
    document.documentElement.classList.remove('dark');
  }, [theme]);

  // Kassir routes (faqat Ombor, Sotuv, Kassa)
  const isCashier = user?.role?.toUpperCase() === 'CASHIER' || user?.role?.toUpperCase() === 'SELLER';
  
  if (window.location.pathname.startsWith('/cashier') || (token && isCashier)) {
    if (!token) {
      return (
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      );
    }

    // Agar kassir bo'lsa va /cashier bilan boshlanmagan joyda bo'lsa, /cashier/sales ga yo'naltirish
    if (isCashier && !window.location.pathname.startsWith('/cashier')) {
      return (
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Navigate to="/cashier/sales" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      );
    }

    return (
      <LanguageProvider>
        <BrowserRouter>
          <CashierLayout>
            <Routes>
              <Route path="/cashier/inventory" element={<ProductsGrouped />} />
              <Route path="/cashier/add-product" element={<CashierAddStock />} />
              <Route path="/cashier/products/:id" element={<ProductDetail />} />
              <Route path="/cashier/sales" element={<Sales />} />
              <Route path="/cashier/sales/add" element={<AddSale />} />
              <Route path="/cashier/orders" element={<Orders />} />
              <Route path="/cashier/customers" element={<Customers />} />
              <Route path="/cashier/drivers" element={<Drivers />} />
              <Route path="/cashier/cashbox" element={<Cashbox />} />
              <Route path="/cashier/bots" element={<BotManagement />} />
              <Route path="*" element={<Navigate to="/cashier/sales" />} />
            </Routes>
          </CashierLayout>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Public routes (autentifikatsiya kerak emas)
  if (window.location.pathname === '/order') {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/order" element={<PublicOrder />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Customer Portal (autentifikatsiya kerak emas)
  if (window.location.pathname === '/customer-portal') {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/customer-portal" element={<CustomerPortalPage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Real Telegram Features (autentifikatsiya kerak emas)
  if (window.location.pathname === '/telegram-features') {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/telegram-features" element={<RealTelegramFeaturesPage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  // Login qilmagan foydalanuvchilar faqat login sahifasini ko'radi
  if (!token) {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products-grouped" element={<ProductsGrouped />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/production" element={<Production />} />
          <Route path="/quality-control" element={<QualityControl />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales-grouped" element={<SalesGrouped />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/debtors" element={<Debtors />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/debug-charts" element={<DebugCharts />} />
          <Route path="/ai-manager" element={<AIManager />} />
          <Route path="/business-ai" element={<BusinessAI />} />
          <Route path="/inventory-ai" element={<InventoryAI />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/super-manager" element={<SuperManager />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/bots" element={<BotManagement />} />
          <Route path="/cashier-bot" element={<CashierBot />} />
          <Route path="/customer-chat" element={<CustomerChat />} />
          <Route path="/customer-chats" element={<CustomerChats />} />
          <Route path="/cashbox" element={<Cashbox />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/cashier-shift" element={<CashierShift />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
