import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Package, DollarSign, Users,
  Activity, Lightbulb, BarChart3
} from 'lucide-react';

export default function SuperManager() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-manager/report');
      setReport(res.data);
    } catch (error) {
      console.error('Hisobotni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    if (health === 'GOOD') return 'text-green-600 bg-green-100';
    if (health === 'WARNING') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'CRITICAL') return 'bg-red-100 border-red-500 text-red-800';
    if (severity === 'WARNING') return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-blue-100 border-blue-500 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg">AI tahlil qilyapti...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p>Hisobotni yuklab bo'lmadi</p>
        <Button onClick={loadReport} className="mt-4">Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Super AI Manager
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Biznesingizning to'liq tahlili va AI tavsiyalari
          </p>
        </div>
        <Button onClick={loadReport} className="w-full sm:w-auto">
          <Activity className="w-4 h-4 mr-2" />
          Yangilash
        </Button>
      </div>

      {/* Overall Health */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Umumiy Holat</p>
              <p className={`text-3xl font-bold ${getHealthColor(report.overallHealth)}`}>
                {report.overallHealth === 'GOOD' && '✅ YAXSHI'}
                {report.overallHealth === 'WARNING' && '⚠️ OGOHLANTIRISH'}
                {report.overallHealth === 'CRITICAL' && '🚨 KRITIK'}
              </p>
            </div>
            <Activity className={`w-16 h-16 ${getHealthColor(report.overallHealth)}`} />
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {report.criticalIssues && report.criticalIssues.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              Kritik Muammolar ({report.criticalIssues.length})
            </h2>
            <div className="space-y-3">
              {report.criticalIssues.map((issue: any, idx: number) => (
                <div key={idx} className={`p-3 sm:p-4 rounded-lg border-l-4 ${getSeverityColor(issue.severity)}`}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold">{issue.title}</p>
                      <p className="text-xs sm:text-sm mt-1">{issue.description}</p>
                      <p className="text-xs sm:text-sm mt-2 font-medium">
                        💡 Harakat: {issue.action}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className={`px-2 py-1 rounded text-xs ${getHealthColor(report.sections.sales.health)}`}>
                {report.sections.sales.health}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Sotuvlar</p>
            <p className="text-2xl font-bold">{formatCurrency(report.sections.sales.today.revenue)}</p>
            <div className="flex items-center gap-1 mt-1">
              {report.sections.sales.trend === 'UP' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs">{report.sections.sales.performance.vsAverage}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-500" />
              <span className={`px-2 py-1 rounded text-xs ${getHealthColor(report.sections.inventory.health)}`}>
                {report.sections.inventory.health}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Ombor</p>
            <p className="text-2xl font-bold">{report.sections.inventory.status.optimal}/{report.sections.inventory.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal mahsulotlar
            </p>
          </CardContent>
        </Card>

        {/* Cashbox */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-500" />
              <span className={`px-2 py-1 rounded text-xs ${getHealthColor(report.sections.cashbox.health)}`}>
                {report.sections.cashbox.health}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Kassa</p>
            <p className="text-2xl font-bold">{formatCurrency(report.sections.cashbox.balance)}</p>
            <p className="text-xs text-green-600 mt-1">
              +{formatCurrency(report.sections.cashbox.today.income)}
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-orange-500" />
              <span className={`px-2 py-1 rounded text-xs ${getHealthColor(report.sections.customers.health)}`}>
                {report.sections.customers.health}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Mijozlar</p>
            <p className="text-2xl font-bold">{report.sections.customers.total}</p>
            <p className="text-xs text-red-600 mt-1">
              Qarz: {formatCurrency(report.sections.customers.debt.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {report.aiRecommendations && report.aiRecommendations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              AI Tavsiyalar ({report.aiRecommendations.length})
            </h2>
            <div className="space-y-4">
              {report.aiRecommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {rec.priority}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{rec.category}</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-semibold mb-2">{rec.title}</p>
                  <ul className="space-y-1">
                    {rec.actions.map((action: string, i: number) => (
                      <li key={i} className="text-xs sm:text-sm flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs sm:text-sm text-green-600 mt-2 font-medium">
                    📈 Kutilayotgan natija: {rec.expectedImpact}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      {report.forecast && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              Biznes Prognozi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Keyingi 7 Kun</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Daromad:</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600">
                      {formatCurrency(report.forecast.next7Days.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Xarajat:</span>
                    <span className="text-xs sm:text-sm font-semibold text-red-600">
                      {formatCurrency(report.forecast.next7Days.expense)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-xs sm:text-sm font-semibold">Foyda:</span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600">
                      {formatCurrency(report.forecast.next7Days.profit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Keyingi 30 Kun</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Daromad:</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600">
                      {formatCurrency(report.forecast.next30Days.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Xarajat:</span>
                    <span className="text-xs sm:text-sm font-semibold text-red-600">
                      {formatCurrency(report.forecast.next30Days.expense)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-xs sm:text-sm font-semibold">Foyda:</span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600">
                      {formatCurrency(report.forecast.next30Days.profit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
              Ishonch darajasi: <span className="font-semibold">{report.forecast.confidence}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      {report.summary && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Boshqaruv Xulosasi</h2>
            <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
              {report.summary}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
