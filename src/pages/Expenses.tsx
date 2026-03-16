import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'SALARY',
    amount: '',
    currency: 'UZS',
    description: '',
  });

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, []);

  const loadExpenses = () => {
    api.get('/expenses').then(({ data }) => setExpenses(data));
  };

  const loadSummary = () => {
    api.get('/expenses/summary').then(({ data }) => {
      const chartData = data.map((item: any) => ({
        name: item.category,
        value: item._sum.amount,
      }));
      setSummary(chartData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/expenses', {
      ...form,
      amount: parseFloat(form.amount),
    });
    setShowForm(false);
    loadExpenses();
    loadSummary();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Xarajatlar</h1>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          {showForm ? 'Bekor qilish' : 'Xarajat Qo\'shish'}
        </Button>
      </div>

      {showForm && (
        <div className="max-h-[80vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Yangi Xarajat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="SALARY">Salary</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="RAW_MATERIALS">Raw Materials</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="TAX">Tax</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                  <option value="CLICK">CLICK</option>
                </select>
              </div>
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <Button type="submit" className="w-full">Xarajat Qo'shish</Button>
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Xarajatlar Taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">So'nggi Xarajatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex flex-col sm:flex-row justify-between items-start gap-2 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-semibold">{expense.category}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(expense.createdAt)}</p>
                  </div>
                  <p className="text-sm sm:text-base font-bold whitespace-nowrap">{formatCurrency(expense.amount, expense.currency)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
