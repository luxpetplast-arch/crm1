import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import api from '../lib/api';
import { Truck, Phone, Mail, MapPin, Plus } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '30 days',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

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
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, form);
      } else {
        await api.post('/suppliers', form);
      }
      setShowModal(false);
      setEditingSupplier(null);
      setForm({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: '30 days',
      });
      loadSuppliers();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email || '',
      phone: supplier.phone,
      address: supplier.address || '',
      paymentTerms: supplier.paymentTerms,
    });
    setShowModal(true);
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await api.put(`/suppliers/${id}`, { active: !active });
      loadSuppliers();
    } catch (error) {
      alert('Status yangilanmadi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Yetkazuvchilar</h1>
        <Button onClick={() => { setEditingSupplier(null); setShowModal(true); }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Yetkazuvchi Qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jami Yetkazuvchilar</p>
                <p className="text-xl sm:text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Faol</p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">
                  {suppliers.filter(s => s.active).length}
                </p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Nofaol</p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">
                  {suppliers.filter(s => !s.active).length}
                </p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Yetkazuvchilar Ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Kompaniya</TableHead>
                  <TableHead className="text-xs sm:text-sm">Aloqa Shaxsi</TableHead>
                  <TableHead className="text-xs sm:text-sm">Telefon</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">To'lov Muddati</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Harakatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold">{supplier.name}</p>
                        {supplier.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{supplier.address}</span>
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{supplier.contactPerson}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {supplier.email && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{supplier.paymentTerms}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.active ? 'success' : 'danger'}>
                        <span className="text-xs">{supplier.active ? 'Faol' : 'Nofaol'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(supplier)}
                          className="text-xs"
                        >
                          Tahrirlash
                        </Button>
                        <Button
                          size="sm"
                          variant={supplier.active ? 'destructive' : 'primary'}
                          onClick={() => toggleActive(supplier.id, supplier.active)}
                          className="text-xs whitespace-nowrap"
                        >
                          {supplier.active ? 'O\'chirish' : 'Faollashtirish'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? 'Yetkazuvchini Tahrirlash' : 'Yangi Yetkazuvchi'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kompaniya Nomi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="Aloqa Shaxsi"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <Input
            label="Manzil"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium">To'lov Muddati</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.paymentTerms}
              onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
            >
              <option value="15 days">15 kun</option>
              <option value="30 days">30 kun</option>
              <option value="45 days">45 kun</option>
              <option value="60 days">60 kun</option>
              <option value="Cash">Naqd</option>
            </select>
          </div>

          <Button type="submit" className="w-full">
            {editingSupplier ? 'Saqlash' : 'Yaratish'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}