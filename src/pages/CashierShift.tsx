import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../lib/utils';
import api from '../lib/api';
import { Clock, CheckCircle } from 'lucide-react';

export default function CashierShift() {
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingBalance, setClosingBalance] = useState('');

  useEffect(() => {
    loadCurrentShift();
    loadShifts();
  }, []);

  const loadCurrentShift = async () => {
    try {
      const { data } = await api.get('/cashier/current-shift');
      setCurrentShift(data);
    } catch (error) {
      console.error('No active shift');
    }
  };

  const loadShifts = async () => {
    try {
      const { data } = await api.get('/cashier/shifts');
      setShifts(data);
    } catch (error) {
      console.error('Failed to load shifts');
    }
  };

  const handleOpenShift = async () => {
    const openingBalance = prompt('Boshlang\'ich balans (UZS):');
    if (!openingBalance) return;

    try {
      await api.post('/cashier/open-shift', {
        openingBalance: parseFloat(openingBalance),
      });
      loadCurrentShift();
      alert('Smena ochildi');
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleCloseShift = async () => {
    try {
      await api.post('/cashier/close-shift', {
        closingBalance: parseFloat(closingBalance),
      });
      setShowCloseModal(false);
      setCurrentShift(null);
      loadShifts();
      alert('Smena yopildi');
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kassir Smenasi</h1>
        {!currentShift ? (
          <Button onClick={handleOpenShift}>
            <Clock className="w-4 h-4 mr-2" />
            Smena Ochish
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => setShowCloseModal(true)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Smena Yopish
          </Button>
        )}
      </div>

      {currentShift && (
        <Card>
          <CardHeader>
            <CardTitle>Joriy Smena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Boshlang'ich Balans</p>
                <p className="text-2xl font-bold">{formatCurrency(currentShift.openingBalance, 'UZS')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Naqd Sotuvlar</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(currentShift.cashSales, 'UZS')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plastik Sotuvlar</p>
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(currentShift.cardSales, 'UZS')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jami Sotuvlar</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(currentShift.totalSales, 'UZS')}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Kutilayotgan Balans</p>
              <p className="text-3xl font-bold">
                {formatCurrency(currentShift.openingBalance + currentShift.cashSales, 'UZS')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Smena Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shifts.map((shift) => {
              const difference = shift.closingBalance - (shift.openingBalance + shift.cashSales);
              return (
                <div key={shift.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{formatDate(shift.startTime)}</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.endTime ? formatDate(shift.endTime) : 'Ochiq'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Jami Sotuvlar</p>
                      <p className="font-bold">{formatCurrency(shift.totalSales, 'UZS')}</p>
                    </div>
                  </div>
                  {shift.status === 'CLOSED' && (
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Boshlang'ich</p>
                        <p className="font-semibold">{formatCurrency(shift.openingBalance, 'UZS')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Yakuniy</p>
                        <p className="font-semibold">{formatCurrency(shift.closingBalance, 'UZS')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Farq</p>
                        <p className={`font-semibold ${difference > 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : ''}`}>
                          {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference), 'UZS')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Smena Yopish"
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Kutilayotgan Balans</p>
            <p className="text-2xl font-bold">
              {formatCurrency(currentShift?.openingBalance + currentShift?.cashSales || 0, 'UZS')}
            </p>
          </div>
          <Input
            label="Haqiqiy Yakuniy Balans (UZS)"
            type="number"
            value={closingBalance}
            onChange={(e) => setClosingBalance(e.target.value)}
            required
          />
          <Button onClick={handleCloseShift} className="w-full">
            Smenani Yopish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
