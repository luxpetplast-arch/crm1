import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import api from '../lib/api';

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

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    vehicleNumber: '',
    email: '',
    password: '',
    telegramBotToken: ''
  });

  useEffect(() => {
    fetchDrivers();
    fetchOrders();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders?status=READY_FOR_DELIVERY');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchAssignments = async (driverId: string) => {
    try {
      const response = await api.get(`/drivers/${driverId}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchChatMessages = async (driverId: string) => {
    try {
      const response = await api.get(`/drivers/${driverId}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/drivers', newDriver);
      setShowAddModal(false);
      setNewDriver({
        name: '',
        phone: '',
        licenseNumber: '',
        vehicleNumber: '',
        email: '',
        password: '',
        telegramBotToken: ''
      });
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

  const handleAssignOrder = async (orderId: string) => {
    if (!selectedDriver) return;
    
    try {
      await api.post(`/drivers/${selectedDriver.id}/assign-order`, { orderId });
      setShowAssignModal(false);
      fetchAssignments(selectedDriver.id);
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver || !newMessage.trim()) return;

    try {
      await api.post(`/drivers/${selectedDriver.id}/chat`, { message: newMessage });
      setNewMessage('');
      fetchChatMessages(selectedDriver.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateDriverStatus = async (driverId: string, status: string) => {
    try {
      await api.put(`/drivers/${driverId}/status`, { status });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'green';
      case 'BUSY': return 'yellow';
      case 'OFFLINE': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Mavjud';
      case 'BUSY': return 'Band';
      case 'OFFLINE': return 'Offline';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Haydovchilar</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Haydovchi qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <Card key={driver.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{driver.name}</h3>
              <Badge color={getStatusColor(driver.status)}>
                {getStatusText(driver.status)}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>📞 {driver.phone}</p>
              <p>🚗 {driver.vehicleNumber}</p>
              <p>📄 {driver.licenseNumber}</p>
              <p>⭐ {driver.rating}/5.0</p>
              <p>🚚 {driver.totalDeliveries} yetkazish</p>
              {driver.telegramUsername && (
                <p>📱 @{driver.telegramUsername}</p>
              )}
              {driver.currentLocation && (
                <p>📍 {driver.currentLocation}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedDriver(driver);
                  fetchAssignments(driver.id);
                  setShowAssignModal(true);
                }}
              >
                Buyurtma berish
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedDriver(driver);
                  fetchChatMessages(driver.id);
                  setShowChatModal(true);
                }}
              >
                Chat
              </Button>

              {driver.status === 'AVAILABLE' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateDriverStatus(driver.id, 'OFFLINE')}
                >
                  Offline qilish
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateDriverStatus(driver.id, 'AVAILABLE')}
                >
                  Online qilish
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Haydovchi qo'shish modali */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yangi haydovchi qo'shish"
      >
        <form onSubmit={handleAddDriver} className="space-y-4">
          <Input
            label="Ism"
            value={newDriver.name}
            onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
            required
          />
          <Input
            label="Telefon"
            value={newDriver.phone}
            onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
            required
          />
          <Input
            label="Guvohnoma raqami"
            value={newDriver.licenseNumber}
            onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
            required
          />
          <Input
            label="Mashina raqami"
            value={newDriver.vehicleNumber}
            onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value })}
            required
          />
          <Input
            label="Email (ixtiyoriy)"
            type="email"
            value={newDriver.email}
            onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
          />
          <Input
            label="Parol (ixtiyoriy)"
            type="password"
            value={newDriver.password}
            onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
          />
          <Input
            label="Telegram Bot Token (ixtiyoriy)"
            value={newDriver.telegramBotToken}
            onChange={(e) => setNewDriver({ ...newDriver, telegramBotToken: e.target.value })}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
          />
          
          <div className="flex gap-2">
            <Button type="submit">Qo'shish</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </Modal>

      {/* Buyurtma tayinlash modali */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`${selectedDriver?.name}ga buyurtma tayinlash`}
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Yetkazish uchun tayyor buyurtmalar:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">${order.totalAmount}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignOrder(order.id)}
                    >
                      Tayinlash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Joriy buyurtmalar:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-2 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">#{assignment.order.orderNumber}</p>
                      <p className="text-xs text-gray-600">{assignment.order.customer.name}</p>
                    </div>
                    <Badge color={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Chat modali */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title={`${selectedDriver?.name} bilan chat`}
      >
        <div className="space-y-4">
          <div className="h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg ${
                  message.senderType === 'ADMIN'
                    ? 'bg-blue-100 ml-4'
                    : 'bg-gray-100 mr-4'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-gray-500">
                  {message.senderType === 'ADMIN' ? 'Admin' : 'Haydovchi'} - {' '}
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Xabar yozing..."
              className="flex-1"
            />
            <Button type="submit">Yuborish</Button>
          </form>
        </div>
      </Modal>
    </div>
  );
}