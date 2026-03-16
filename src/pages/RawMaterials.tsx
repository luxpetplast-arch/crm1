import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import api from '../lib/api';
import { Package2, AlertTriangle, TrendingUp, Truck } from 'lucide-react';

export default function RawMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    unit: 'kg',
    minStockLimit: '',
    unitPrice: '',
    supplierId: '',
  });

  useEffect(() => {
    loadMaterials();
    loadSuppliers();
  }, []);

  const loadMaterials = async () => {
    try {
      const { data } = await api.get('/raw-materials');
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load raw materials');
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/raw-materials', {
        ...form,
        minStockLimit: parseFloat(form.minStockLimit),
        unitPrice: parseFloat(form.unitPrice),
      });
      setShowModal(false);
      setForm({
        name: '',
        unit: 'kg',
        minStockLimit: '',
        unitPrice: '',
        supplierId: '',
      });
      loadMaterials();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const getStockStatus = (material: any) => {
    if (material.currentStock === 0) return { color: 'text-red-500', label: 'Tugagan', variant: 'danger' };
    if (material.currentStock < material.minStockLimit) return { color: 'text-yellow-500', label: 'Kam', variant: 'warning' };
    return { color: 'text-green-500', label: 'Yaxshi', variant: 'success' };
  };

  const totalValue = materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
  const lowStockCount = materials.filter(m => m.currentStock < m.minStockLimit).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Xom Ashyo</h1>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Package2 className="w-4 h-4 mr-2" />
          Xom Ashyo Qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jami Turlar</p>
                <p className="text-xl sm:text-2xl font-bold">{materials.length}</p>
              </div>
              <Package2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Kam Zaxira</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-500">{lowStockCount}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jami Qiymat</p>
                <p className="text-lg sm:text-2xl font-bold text-green-500">
                  {totalValue.toLocaleString()} UZS
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Yetkazuvchilar</p>
                <p className="text-xl sm:text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => {
          const status = getStockStatus(material);
          return (
            <Card key={material.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{material.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {material.supplier?.name || 'Yetkazuvchi yo\'q'}
                    </p>
                  </div>
                  <Package2 className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Joriy Zaxira:</span>
                    <span className={`font-semibold ${status.color}`}>
                      {material.currentStock} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Minimal Limit:</span>
                    <span className="font-semibold">{material.minStockLimit} {material.unit}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Birlik Narxi:</span>
                    <span className="font-semibold">{material.unitPrice.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Jami Qiymat:</span>
                    <span className="font-semibold">
                      {(material.currentStock * material.unitPrice).toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Badge variant={status.variant as any}>{status.label}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi Xom Ashyo"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nomi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-medium">O'lchov Birligi</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="ton">Tonna (ton)</option>
              <option value="litr">Litr (l)</option>
              <option value="dona">Dona</option>
            </select>
          </div>

          <Input
            label="Minimal Zaxira Limiti"
            type="number"
            step="0.01"
            value={form.minStockLimit}
            onChange={(e) => setForm({ ...form, minStockLimit: e.target.value })}
            required
          />

          <Input
            label="Birlik Narxi (UZS)"
            type="number"
            step="0.01"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-medium">Yetkazuvchi</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              required
            >
              <option value="">Yetkazuvchini tanlang</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full">
            Xom Ashyo Qo'shish
          </Button>
        </form>
      </Modal>
    </div>
  );
}