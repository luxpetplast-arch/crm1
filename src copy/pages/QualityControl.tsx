import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function QualityControl() {
  const [checks, setChecks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    batchId: '',
    checkType: 'PRODUCTION',
    notes: '',
    defects: [] as string[],
  });

  const defectTypes = [
    'Rang noto\'g\'ri',
    'O\'lcham xatosi',
    'Yuzada nuqson',
    'Og\'irlik farqi',
    'Deformatsiya',
    'Boshqa',
  ];

  useEffect(() => {
    loadChecks();
    loadProducts();
  }, []);

  const loadChecks = async () => {
    try {
      const { data } = await api.get('/quality-checks');
      setChecks(data);
    } catch (error) {
      console.error('Failed to load quality checks');
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
      const status = form.defects.length > 0 ? 'FAILED' : 'PASSED';
      await api.post('/quality-checks', {
        ...form,
        status,
        defects: form.defects.length > 0 ? form.defects : null,
      });
      setShowModal(false);
      setForm({
        productId: '',
        batchId: '',
        checkType: 'PRODUCTION',
        notes: '',
        defects: [],
      });
      loadChecks();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const toggleDefect = (defect: string) => {
    setForm(prev => ({
      ...prev,
      defects: prev.defects.includes(defect)
        ? prev.defects.filter(d => d !== defect)
        : [...prev.defects, defect]
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PASSED: 'success',
      FAILED: 'danger',
      PENDING: 'warning',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      INCOMING: 'Kiruvchi',
      PRODUCTION: 'Ishlab chiqarish',
      OUTGOING: 'Chiquvchi',
    };
    return labels[type] || type;
  };

  const passedCount = checks.filter(c => c.status === 'PASSED').length;
  const failedCount = checks.filter(c => c.status === 'FAILED').length;
  const passRate = checks.length > 0 ? Math.round((passedCount / checks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Sifat Nazorati</h1>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Shield className="w-4 h-4 mr-2" />
          Yangi Tekshiruv
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">O'tgan</p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">{passedCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">O'tmagan</p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">{failedCount}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">O'tish Foizi</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{passRate}%</p>
              </div>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jami Tekshiruvlar</p>
                <p className="text-xl sm:text-2xl font-bold">{checks.length}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sifat Tekshiruvlari</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Tur</TableHead>
                <TableHead>Tekshiruvchi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nuqsonlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>{formatDate(check.checkDate)}</TableCell>
                  <TableCell>{check.product?.name || 'N/A'}</TableCell>
                  <TableCell>{getTypeLabel(check.checkType)}</TableCell>
                  <TableCell>{check.checkedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(check.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(check.status)}
                        {check.status === 'PASSED' ? 'O\'tdi' : check.status === 'FAILED' ? 'O\'tmadi' : 'Kutilmoqda'}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {check.defects && check.defects.length > 0 ? (
                      <div className="space-y-1">
                        {check.defects.map((defect: string, index: number) => (
                          <Badge key={index} variant="danger" className="mr-1">
                            {defect}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Nuqson yo'q</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi Sifat Tekshiruvi"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mahsulot</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Mahsulotni tanlang</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Partiya ID (ixtiyoriy)"
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium">Tekshiruv Turi</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.checkType}
              onChange={(e) => setForm({ ...form, checkType: e.target.value })}
            >
              <option value="INCOMING">Kiruvchi</option>
              <option value="PRODUCTION">Ishlab chiqarish</option>
              <option value="OUTGOING">Chiquvchi</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Aniqlangan Nuqsonlar</label>
            <div className="grid grid-cols-2 gap-2">
              {defectTypes.map((defect) => (
                <label key={defect} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.defects.includes(defect)}
                    onChange={() => toggleDefect(defect)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{defect}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Izohlar"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Natija:</p>
            <Badge variant={form.defects.length > 0 ? 'danger' : 'success'}>
              {form.defects.length > 0 ? 'O\'tmadi' : 'O\'tdi'}
            </Badge>
          </div>

          <Button type="submit" className="w-full">
            Tekshiruvni Saqlash
          </Button>
        </form>
      </Modal>
    </div>
  );
}