import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import ProductSelector from '../components/ProductSelector';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import { Factory, Play, CheckCircle, XCircle, Clock, Plus, Package } from 'lucide-react';

export default function Production() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    targetQuantity: '',
    plannedDate: '',
    shift: 'Kunduzgi',
    supervisorId: '',
    notes: '',
  });

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/production/orders');
      setOrders(data);
    } catch (error) {
      console.error('Ishlab chiqarish buyurtmalarini yuklashda xatolik');
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/production/orders', {
        ...form,
        targetQuantity: parseInt(form.targetQuantity),
        plannedDate: new Date(form.plannedDate),
      });
      setShowForm(false);
      setForm({
        productId: '',
        productName: '',
        targetQuantity: '',
        plannedDate: '',
        shift: 'Kunduzgi',
        supervisorId: '',
        notes: '',
      });
      setProductSearch('');
      loadOrders();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.put(`/production/orders/${id}/status`, { status });
      loadOrders();
    } catch (error) {
      alert('Status yangilanmadi');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PLANNED: 'info',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      PLANNED: 'Rejalashtirilgan',
      IN_PROGRESS: 'Jarayonda',
      COMPLETED: 'Tugallangan',
      CANCELLED: 'Bekor qilingan',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Factory className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Ishlab Chiqarish
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ishlab chiqarish jarayonini boshqarish
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg" className="w-full sm:w-auto">
          {showForm ? 'Bekor qilish' : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Yangi Buyurtma
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Rejalashtirilgan</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-500">
                  {orders.filter(o => o.status === 'PLANNED').length}
                </p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jarayonda</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-500">
                  {orders.filter(o => o.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tugallangan</p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">
                  {orders.filter(o => o.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Samaradorlik</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'COMPLETED').length / orders.length) * 100) : 0}%
                </p>
              </div>
              <Factory className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Ishlab Chiqarish Buyurtmalari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Buyurtma #</TableHead>
                  <TableHead className="text-xs sm:text-sm">Mahsulot</TableHead>
                  <TableHead className="text-xs sm:text-sm">Miqdor</TableHead>
                  <TableHead className="text-xs sm:text-sm">Sana</TableHead>
                  <TableHead className="text-xs sm:text-sm">Smena</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Harakatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs sm:text-sm">{order.orderNumber}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{order.product?.name || 'N/A'}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.actualQuantity}/{order.targetQuantity} qop
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{formatDate(order.plannedDate)}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{order.shift}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.status)}>
                        <div className="flex items-center gap-1 text-xs">
                          {getStatusIcon(order.status)}
                          <span className="hidden sm:inline">{getStatusLabel(order.status)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {order.status === 'PLANNED' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {order.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Yangi Buyurtma Formasi */}
      {showForm && (
        <div className="max-h-[85vh] overflow-y-auto">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 sticky top-0 z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Factory className="w-6 h-6 text-primary" />
              Yangi Ishlab Chiqarish Buyurtmasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mahsulot */}
              <div>
                <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-purple-600">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  1. Mahsulotni Tanlang
                </label>
                <ProductSelector
                  products={products}
                  selectedId={form.productId}
                  searchValue={productSearch}
                  onSearchChange={setProductSearch}
                  onSelect={(id, name) => {
                    setForm(prev => ({ ...prev, productId: id, productName: name }));
                  }}
                />
              </div>

              {/* Miqdor */}
              <div>
                <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Factory className="w-4 h-4" />
                  </div>
                  2. Maqsadli Miqdor
                </label>
                <input
                  type="number"
                  value={form.targetQuantity}
                  onChange={(e) => setForm({ ...form, targetQuantity: e.target.value })}
                  placeholder="Necha qop ishlab chiqarish kerak?"
                  min="1"
                  required
                  className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Sana va Smena */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-green-600">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    3. Rejalashtirilgan Sana
                  </label>
                  <input
                    type="date"
                    value={form.plannedDate}
                    onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-orange-600">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    4. Smena
                  </label>
                  <select
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800"
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  >
                    <option value="Kunduzgi">☀️ Kunduzgi (08:00-20:00)</option>
                    <option value="Tungi">🌙 Tungi (20:00-08:00)</option>
                  </select>
                </div>
              </div>

              {/* Izohlar */}
              <div>
                <label className="block text-sm font-medium mb-2">Izohlar (ixtiyoriy)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1 text-lg py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" size="lg">
                  <Factory className="w-5 h-5 mr-2" />
                  Buyurtma Yaratish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}