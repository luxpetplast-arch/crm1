import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import api from '../lib/api';
import { 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  TrendingUp, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;
  telegramChatId?: string;
  telegramUsername?: string;
  status: string;
  rating: number;
  totalDeliveries: number;
  currentLocation?: string;
  active: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  _count?: {
    assignments: number;
  };
}

interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  deliveryAddress: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    customer: {
      name: string;
      phone: string;
    };
  };
}

export default function DriversGrouped() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Haydovchilarni yuklashda xatolik:', error);
      setLoading(false);
    }
  };

  // Haydovchilarni statuslar bo'yicha guruhlash
  const getDriverType = (driver: Driver) => {
    if (!driver.active) return { name: 'Nofaol', icon: '❌', color: 'bg-red-50 border-red-200 text-red-800' };
    if (driver.status === 'busy') return { name: 'Band', icon: '🚚', color: 'bg-orange-50 border-orange-200 text-orange-800' };
    if (driver.status === 'available') return { name: 'Bo\'sh', icon: '✅', color: 'bg-green-50 border-green-200 text-green-800' };
    if (driver.rating >= 4.5) return { name: 'A\'lo', icon: '⭐', color: 'bg-purple-50 border-purple-200 text-purple-800' };
    if (driver.totalDeliveries >= 100) return { name: 'Tajribali', icon: '🏆', color: 'bg-blue-50 border-blue-200 text-blue-800' };
    return { name: 'Oddiy', icon: '👤', color: 'bg-gray-50 border-gray-200 text-gray-800' };
  };

  // Haydovchilarni turlar bo'yicha guruhlash
  const groupDriversByType = () => {
    if (selectedType === 'all') {
      const types = [
        { key: 'active', name: 'Faol', icon: '✅' },
        { key: 'busy', name: 'Band', icon: '🚚' },
        { key: 'inactive', name: 'Nofaol', icon: '❌' },
        { key: 'top', name: 'A\'lo', icon: '⭐' },
        { key: 'experienced', name: 'Tajribali', icon: '🏆' }
      ];

      return types.map(type => {
        const typeDrivers = drivers.filter(driver => {
          switch (type.key) {
            case 'active':
              return driver.active;
            case 'busy':
              return driver.status === 'busy';
            case 'inactive':
              return !driver.active;
            case 'top':
              return driver.rating >= 4.5;
            case 'experienced':
              return driver.totalDeliveries >= 100;
            default:
              return false;
          }
        });

        return {
          type,
          drivers: typeDrivers,
          totalDeliveries: typeDrivers.reduce((sum, d) => sum + (d.totalDeliveries || 0), 0),
          averageRating: typeDrivers.length > 0 
            ? typeDrivers.reduce((sum, d) => sum + (d.rating || 0), 0) / typeDrivers.length 
            : 0
        };
      });
    } else {
      const type = {
        key: selectedType,
        name: selectedType === 'active' ? 'Faol' : 
              selectedType === 'busy' ? 'Band' :
              selectedType === 'inactive' ? 'Nofaol' :
              selectedType === 'top' ? 'A\'lo' : 'Tajribali',
        icon: selectedType === 'active' ? '✅' : 
              selectedType === 'busy' ? '🚚' :
              selectedType === 'inactive' ? '❌' :
              selectedType === 'top' ? '⭐' : '🏆'
      };

      const typeDrivers = drivers.filter(driver => {
        switch (selectedType) {
          case 'active':
            return driver.active;
          case 'busy':
            return driver.status === 'busy';
          case 'inactive':
            return !driver.active;
          case 'top':
            return driver.rating >= 4.5;
          case 'experienced':
            return driver.totalDeliveries >= 100;
          default:
            return false;
        }
      });

      return [{
        type,
        drivers: typeDrivers,
        totalDeliveries: typeDrivers.reduce((sum, d) => sum + (d.totalDeliveries || 0), 0),
        averageRating: typeDrivers.length > 0 
          ? typeDrivers.reduce((sum, d) => sum + (d.rating || 0), 0) / typeDrivers.length 
          : 0
      }];
    }
  };

  const groupedDrivers = groupDriversByType();

  // Qidiruv
  const filteredGroups = groupedDrivers.map(group => ({
    ...group,
    drivers: group.drivers.filter(driver => 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🚗 Haydovchilar
          </h1>
          <p className="text-muted-foreground mt-2">
            Turlar bo'yicha guruhlangan haydovchilar
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/drivers'} 
            className="bg-gray-600 hover:bg-gray-700"
          >
            📋 Oddiy
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            ➕ Yangi Haydovchi
          </Button>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-sm font-medium text-blue-600">Jami Haydovchilar</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{drivers.length}</p>
            <p className="text-xs text-blue-600 mt-1">Barcha turlar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-sm font-medium text-green-600">Faol Haydovchilar</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {drivers.filter(d => d.active).length}
            </p>
            <p className="text-xs text-green-600 mt-1">Hozir ishlayotgan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🚚</span>
              <span className="text-sm font-medium text-orange-600">Band Haydovchilar</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {drivers.filter(d => d.status === 'busy').length}
            </p>
            <p className="text-xs text-orange-600 mt-1">Yo'lda ketayotgan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-sm font-medium text-purple-600">Jami Yetkazishlar</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {drivers.reduce((sum, d) => sum + (d.totalDeliveries || 0), 0)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Barcha vaqt davomida</p>
          </CardContent>
        </Card>
      </div>

      {/* Qidiruv va Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="🔍 Haydovchi nomi, telefoni yoki mashina raqami..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            📊 Barchasi ({drivers.length})
          </Button>
          <Button
            variant={selectedType === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('active')}
          >
            ✅ Faol ({drivers.filter(d => d.active).length})
          </Button>
          <Button
            variant={selectedType === 'busy' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('busy')}
          >
            🚚 Band ({drivers.filter(d => d.status === 'busy').length})
          </Button>
          <Button
            variant={selectedType === 'top' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('top')}
          >
            ⭐ A\'lo ({drivers.filter(d => d.rating >= 4.5).length})
          </Button>
          <Button
            variant={selectedType === 'experienced' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('experienced')}
          >
            🏆 Tajribali ({drivers.filter(d => d.totalDeliveries >= 100).length})
          </Button>
        </div>
      </div>

      {/* Guruhlangan haydovchilar */}
      <div className="space-y-6">
        {filteredGroups.map((group, index) => {
          if (group.drivers.length === 0) {
            return (
              <div key={group.type.key} className="text-center py-8">
                <Card className="p-6">
                  <div className="text-gray-500">
                    <span className="text-2xl">{group.type.icon}</span>
                    <p className="mt-2">{group.type.name} haydovchilar yo'q</p>
                  </div>
                </Card>
              </div>
            );
          }

          return (
            <div key={group.type.key} className="space-y-4">
              {/* Tur sarlavhasi */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{group.type.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{group.type.name} Haydovchilar</h2>
                        <p className="text-sm text-gray-600">
                          {group.drivers.length} ta haydovchi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${group.type.color}`}>
                        {group.type.name}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Haydovchilar soni</p>
                      <p className="text-2xl font-bold text-blue-600">{group.drivers.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Jami yetkazishlar</p>
                      <p className="text-2xl font-bold text-green-600">{group.totalDeliveries}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">O'rtacha reyting</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {group.averageRating > 0 ? group.averageRating.toFixed(1) : '0.0'} ⭐
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Haydovchilar ro'yxati */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.drivers.slice(0, 6).map((driver) => {
                  const driverType = getDriverType(driver);
                  return (
                    <Card key={driver.id} className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${driver.active ? 'border-green-200' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{driver.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${driverType.color}`}>
                                {driverType.icon} {driverType.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {driver.phone}
                              </p>
                              <p className="flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                {driver.vehicleNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-lg">⭐</span>
                              <span className="font-bold">{driver.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {driver.totalDeliveries || 0} yetkazish
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              driver.active ? 'bg-green-100 text-green-800' : 
                              driver.status === 'busy' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {driver.active ? '✅ Faol' : driver.status === 'busy' ? '🚚 Band' : '❌ Nofaol'}
                            </span>
                            {driver.currentLocation && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                📍 {driver.currentLocation}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/drivers/${driver.id}`)}
                            >
                              👁 Ko'rish
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {group.drivers.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => alert(`Barcha ${group.drivers.length} ta haydovchi ko'rsatiladi`)}>
                    Yana {group.drivers.length - 6} ta haydovchini ko'rish
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <span className="text-4xl">⏳</span>
            <p className="mt-4">Haydovchilar yuklanmoqda...</p>
          </div>
        </div>
      )}

      {!loading && drivers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <span className="text-4xl">🚗</span>
            <h3 className="text-xl font-semibold mt-4 mb-2">Haydovchilar yo'q</h3>
            <p className="mb-4">Birinchi haydovchini qo'shish uchun "Yangi Haydovchi" tugmasini bosing</p>
            <Button onClick={() => setShowAddModal(true)}>
              ➕ Yangi Haydovchi
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
