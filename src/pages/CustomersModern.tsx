import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  User,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { latinToCyrillic } from '../lib/transliterator';
import { errorHandler } from '../lib/professionalErrorHandler';
import api from '../lib/professionalApi';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  balance: number;
  debt: number;
  createdAt: string;
}

export default function CustomersModern() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCashier = location.pathname.startsWith('/cashier');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    category: 'NORMAL'
  });

  const categories = ['all', 'NORMAL', 'VIP', 'WHOLESALE'];

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/customers');
        const customersData = response.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          category: c.category,
          balance: c.balance,
          debt: c.debt,
          createdAt: c.createdAt
        }));
        
        setCustomers(customersData);
        
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(customer => customer.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCustomers(filtered);
  }, [customers, selectedCategory, searchTerm]);

  const handleAddCustomer = async () => {
  console.log('handleAddCustomer funksiyasi chaqirildi!');
  console.log('New customer data:', newCustomer);
  
  try {
    if (!newCustomer.name || !newCustomer.phone) {
      console.log('Validation failed: missing name or phone');
      alert(latinToCyrillic('Ism va telefon raqami kiritilishi shart!'));
      return;
    }

    console.log('API ga so\'rov yuborilmoqda...');
    const response = await api.post('/customers', newCustomer);
    console.log('API javobi:', response.data);
    
    const createdCustomer = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone,
      address: response.data.address,
      category: response.data.category,
      balance: response.data.balance,
      debt: response.data.debt,
      createdAt: response.data.createdAt
    };

    console.log('Customer list yangilanmoqda...');
    setCustomers([...customers, createdCustomer]);
    setNewCustomer({ name: '', phone: '', address: '', category: 'NORMAL' });
    setShowAddForm(false);
    
    alert(latinToCyrillic('Mijoz muvaffaqiyatli qo\'shildi!'));
  } catch (error: any) {
    console.error('Customer creation error:', error);
    alert(error.response?.data?.error || latinToCyrillic('Mijoz qo\'shishda xatolik yuz berdi'));
  }
};

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'VIP': return 'badge-warning';
      case 'WHOLESALE': return 'badge-success';
      case 'NORMAL': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 bg-dots-pattern">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {latinToCyrillic("Mijozlar")}
            </h1>
            <p className="text-gray-600">
              {filteredCustomers.length} {latinToCyrillic("ta mijoz")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={latinToCyrillic("Мижозларни қидириш...")}
                className="input-modern w-full pl-12"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="w-5 h-5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-modern pl-12 appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? latinToCyrillic("Барчаси") : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Add Customer Button */}
          <button
            onClick={() => {
              console.log('Yangi mijoz tugmasi bosildi!');
              setShowAddForm(true);
            }}
            className="btn-gradient-primary px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>{latinToCyrillic("Yangi mijoz")}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-lg font-semibold text-blue-600 mt-4">{latinToCyrillic("Yuklanmoqda...")}</p>
            </div>
          </div>
        )}

        {/* Customers Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="glass-card hover-lift p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs ${getCategoryBadgeColor(customer.category)}`}>
                    {customer.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-3">{customer.name}</h3>
                
                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-secondary">{customer.email}</span>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-secondary">{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-secondary">{customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">{latinToCyrillic("Balans")}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {customer.balance.toLocaleString()} UZS
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{latinToCyrillic("Qarz")}</p>
                    <p className={`text-lg font-bold ${customer.debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {customer.debt.toLocaleString()} UZS
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(isCashier ? `/cashier/customers/${customer.id}` : `/customers/${customer.id}`)}
                    className="btn-gradient-secondary flex-1 p-2 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{latinToCyrillic("Ko'rish")}</span>
                  </button>
                  <button
                    className="btn-gradient-danger p-2 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCustomers.length === 0 && (
          <div className="glass-card p-12 rounded-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{latinToCyrillic("Mijozlar topilmadi")}</h3>
              <p className="text-gray-500">
                {latinToCyrillic("Qidirish shartlarini o'zgartirib qayta urinib ko'ring")}
              </p>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {!loading && customers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card hover-lift p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{latinToCyrillic("Jami mijozlar")}</p>
                  <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-card hover-lift p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{latinToCyrillic("Jami balans")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} UZS
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card hover-lift p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{latinToCyrillic("Jami qarz")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.reduce((sum, c) => sum + c.debt, 0).toLocaleString()} UZS
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 w-full max-w-md mx-4 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">{latinToCyrillic("Yangi mijoz qo'shish")}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{latinToCyrillic("Ism")}</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={latinToCyrillic("Mijoz ismi")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{latinToCyrillic("Telefon")}</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+998901234567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{latinToCyrillic("Manzil")}</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={latinToCyrillic("Manzil (ixtiyoriy)")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{latinToCyrillic("Kategoriya")}</label>
                  <select
                    value={newCustomer.category}
                    onChange={(e) => setNewCustomer({ ...newCustomer, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NORMAL">{latinToCyrillic("Oddiy")}</option>
                    <option value="VIP">VIP</option>
                    <option value="WHOLESALE">{latinToCyrillic("Ulgurji")}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCustomer}
                  className="btn-gradient-primary flex-1"
                >
                  {latinToCyrillic("Qo'shish")}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCustomer({ name: '', phone: '', address: '', category: 'NORMAL' });
                  }}
                  className="btn flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {latinToCyrillic("Bekor qilish")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
