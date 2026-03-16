import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import './i18n'; // i18n konfiguratsiyasini yuklash
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
import Layout from './components/Layout';
import Debtors from './pages/Debtors';

function App() {
  const { token } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Public routes (autentifikatsiya kerak emas)
  if (window.location.pathname === '/order') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/order" element={<PublicOrder />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Customer Portal (autentifikatsiya kerak emas)
  if (window.location.pathname === '/customer-portal') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/customer-portal" element={<CustomerPortalPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Real Telegram Features (autentifikatsiya kerak emas)
  if (window.location.pathname === '/telegram-features') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/telegram-features" element={<RealTelegramFeaturesPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Login qilmagan foydalanuvchilar faqat login sahifasini ko'radi
  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/production" element={<Production />} />
          <Route path="/quality-control" element={<QualityControl />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/debtors" element={<Debtors />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/ai-manager" element={<AIManager />} />
          <Route path="/inventory-ai" element={<InventoryAI />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/super-manager" element={<SuperManager />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/bots" element={<BotManagement />} />
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
  );
}

export default App;
