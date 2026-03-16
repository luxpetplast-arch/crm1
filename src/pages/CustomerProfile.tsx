import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  Send
} from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    try {
      const [customerRes, salesRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/sales?customerId=${id}`)
      ]);
      setCustomer(customerRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('Mijoz ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">Mijoz topilmadi</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Orqaga
        </Button>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    if (category === 'VIP') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (category === 'RISK') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const totalPurchases = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaid = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const averagePurchase = sales.length > 0 ? totalPurchases / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <h1 className="text-3xl font-bold">Mijoz Profili</h1>
        </div>
        {customer.telegramChatId && (
          <Button onClick={() => navigate('/customer-chat')}>
            <Send className="w-4 h-4 mr-2" />
            Telegram Xabar Yuborish
          </Button>
        )}
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                  )}
                  {customer.telegramUsername && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <span>📱</span>
                      @{customer.telegramUsername}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(customer.createdAt)}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(customer.category)}`}>
                    {customer.category}
                  </span>
                  {customer.telegramChatId && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      📱 Telegram Bog'langan
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balans</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.balance, 'UZS')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qarz</p>
                <p className={`text-2xl font-bold ${customer.debt > 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(customer.debt, 'UZS')}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${customer.debt > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Sotuvlar</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">O'rtacha Xarid</p>
                <p className="text-2xl font-bold">{formatCurrency(averagePurchase, 'UZS')}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Xaridlar Xulosasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Jami Xaridlar</p>
              <p className="text-xl font-bold">{formatCurrency(totalPurchases, 'UZS')}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">To'langan</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid, 'UZS')}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Qolgan Qarz</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalPurchases - totalPaid, 'UZS')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sotuvlar Tarixi</CardTitle>
            <Button onClick={() => navigate('/sales')}>
              Yangi Sotuv
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Hali sotuvlar yo'q</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Sana</th>
                    <th className="text-left py-3 px-4">Mahsulot</th>
                    <th className="text-right py-3 px-4">Miqdor</th>
                    <th className="text-right py-3 px-4">Jami</th>
                    <th className="text-right py-3 px-4">To'langan</th>
                    <th className="text-right py-3 px-4">Qarz</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{formatDate(sale.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{sale.product?.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.bagType}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{sale.quantity} qop</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(sale.totalAmount, sale.currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(sale.paidAmount, sale.currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {formatCurrency(sale.totalAmount - sale.paidAmount, sale.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sale.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : sale.paymentStatus === 'PARTIAL'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {sale.paymentStatus === 'PAID' ? 'To\'langan' : 
                           sale.paymentStatus === 'PARTIAL' ? 'Qisman' : 'Qarz'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
