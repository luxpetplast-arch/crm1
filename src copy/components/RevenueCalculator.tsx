import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import Button from './Button';
import Input from './Input';
import { formatCurrency } from '../lib/utils';
import { safeParseFloat, clamp } from '../lib/safe-math';

export default function RevenueCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [bags, setBags] = useState('');
  const [pricePerBag, setPricePerBag] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const [discount, setDiscount] = useState('0');

  const calculateTotal = () => {
    const bagsNum = safeParseFloat(bags, 0);
    const priceNum = safeParseFloat(pricePerBag, 0);
    const discountNum = clamp(safeParseFloat(discount, 0), 0, 100);
    
    const subtotal = bagsNum * priceNum;
    const discountAmount = (subtotal * discountNum) / 100;
    const total = subtotal - discountAmount;
    
    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotal();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-6 z-40 p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all shadow-lg hover:scale-105"
        title="Daromad Kalkulyatori"
      >
        <Calculator className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Calculator Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-slide-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <CardTitle>Daromad Kalkulyatori</CardTitle>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Qoplar Soni
                </label>
                <Input
                  type="number"
                  value={bags}
                  onChange={(e) => setBags(e.target.value)}
                  placeholder="Masalan: 100"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Qop Narxi
                </label>
                <Input
                  type="number"
                  value={pricePerBag}
                  onChange={(e) => setPricePerBag(e.target.value)}
                  placeholder="Masalan: 50000"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valyuta
                </label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="UZS">UZS - O'zbek So'mi</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="EUR">EUR - Yevro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chegirma (%)
                </label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

              {/* Results */}
              <div className="mt-6 space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Oraliq Jami:</span>
                  <span className="font-semibold">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chegirma:</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(discountAmount, currency)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-semibold">Jami:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Bu kalkulyator tez hisoblash uchun mo'ljallangan. 
                  Aniq sotuv uchun Sotuvlar sahifasidan foydalaning.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setBags('');
                    setPricePerBag('');
                    setDiscount('0');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Tozalash
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Yopish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
