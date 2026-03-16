import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import api from '../lib/api';
import { Download, FileText } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      switch (reportType) {
        case 'sales':
          endpoint = '/sales';
          break;
        case 'expenses':
          endpoint = '/expenses';
          break;
        case 'customers':
          endpoint = '/customers';
          break;
        case 'products':
          endpoint = '/products';
          break;
      }

      const { data: result } = await api.get(`${endpoint}?${params.toString()}`);
      setData(result);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    let csv = '';
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';

    data.forEach((row) => {
      csv += headers.map((header) => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Hisobotlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Hisobot Yaratish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium">Hisobot Turi</label>
              <select
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sales">Sotuvlar</option>
                <option value="expenses">Xarajatlar</option>
                <option value="customers">Mijozlar</option>
                <option value="products">Mahsulotlar</option>
              </select>
            </div>
            <Input
              label="Boshlanish Sanasi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Tugash Sanasi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex items-end gap-2">
              <Button onClick={generateReport} disabled={loading} className="flex-1 text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {loading ? 'Yuklanmoqda...' : 'Yaratish'}
              </Button>
              {data.length > 0 && (
                <Button onClick={exportToCSV} variant="secondary" size="sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Natijalar ({data.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).slice(0, 6).map((key) => (
                      <TableHead key={key} className="text-xs sm:text-sm">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 50).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).slice(0, 6).map((value: any, i) => (
                        <TableCell key={i} className="text-xs sm:text-sm">
                          {typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : String(value).slice(0, 30)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
