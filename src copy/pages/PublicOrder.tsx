import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Send } from 'lucide-react';
import Button from '../components/Button';
import { Card } from '../components/Card';

interface Product {
  id: string;
  name: string;
  pricePerBag: number;
  currentStock: number;
  bagType: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerBag: number;
}

export default function PublicOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/public');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        pricePerBag: product.pricePerBag
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.pricePerBag), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Savatcha bo\'sh!');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Ism va telefon raqamini kiriting!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerInfo,
          items: cart
        })
      });

      if (response.ok) {
        setSuccess(true);
        setCart([]);
        setCustomerInfo({ name: '', phone: '', email: '', notes: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert('Xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏢 AzizTrades ERP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Buyurtma berish tizimi
          </p>
        </div>

        {success && (
          <div className="mb-8 p-6 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              ✅ Buyurtma qabul qilindi!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Tez orada siz bilan bog'lanamiz. Rahmat!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                📦 Mahsulotlar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {product.bagType}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      ${product.pricePerBag.toFixed(2)} / qop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Omborda: {product.currentStock} qop
                    </p>
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full"
                      disabled={product.currentStock === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Savatga qo'shish
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cart & Order Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Savatcha ({cart.length})
              </h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Savatcha bo'sh
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div
                        key={item.productId}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{item.productName}</h4>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            ${(item.quantity * item.pricePerBag).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Jami:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ism *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="+998901234567"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Izoh
                      </label>
                      <textarea
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <Card>
            <h3 className="text-xl font-bold mb-4">📞 Aloqa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
              <div>
                <p className="font-semibold">Telefon:</p>
                <p>+998 90 123 45 67</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>info@aziztrades.com</p>
              </div>
              <div>
                <p className="font-semibold">Manzil:</p>
                <p>Toshkent, O'zbekiston</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
