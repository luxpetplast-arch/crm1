import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import api from '../lib/api';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function Forecast() {
  const [forecasts, setForecasts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/forecast/overview').then(({ data }) => setForecasts(data));
  }, []);

  const getVelocityIcon = (velocity: string) => {
    if (velocity === 'fast') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (velocity === 'slow') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'critical') return 'bg-red-500/10 border-red-500';
    if (status === 'urgent') return 'bg-yellow-500/10 border-yellow-500';
    return 'bg-green-500/10 border-green-500';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">AI Sotuv Prognozi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {forecasts.map((forecast) => (
          <Card key={forecast.productId} className={`border-2 ${getStatusColor(forecast.status)}`}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">{forecast.productName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize">{forecast.velocity} harakatlanuvchi</p>
                </div>
                {getVelocityIcon(forecast.velocity)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Joriy Zaxira:</span>
                  <span className="font-semibold">{forecast.currentStock} qop</span>
                </div>

                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Kunlik O'rtacha Talab:</span>
                  <span className="font-semibold">{forecast.avgDailyDemand} qop</span>
                </div>

                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Tugashgacha Kunlar:</span>
                  <span className={`font-semibold ${forecast.daysUntilStockout < 7 ? 'text-red-500' : ''}`}>
                    {forecast.daysUntilStockout === 0 ? 'Tugagan' : `${forecast.daysUntilStockout} kun`}
                  </span>
                </div>

                {forecast.status === 'critical' && (
                  <div className="mt-4 p-2 sm:p-3 bg-red-500/20 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-red-500">⚠️ Kritik: Zudlik bilan ishlab chiqarish kerak!</p>
                  </div>
                )}

                {forecast.status === 'urgent' && (
                  <div className="mt-4 p-2 sm:p-3 bg-yellow-500/20 rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold text-yellow-600">⚡ Shoshilinch: Tez orada ishlab chiqarishni rejalashtiring</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Production Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecasts
              .filter((f) => f.status !== 'ok')
              .map((forecast) => (
                <div key={forecast.productId} className="p-3 sm:p-4 border border-border rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="text-sm sm:text-base font-semibold">{forecast.productName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {forecast.daysUntilStockout} kun ichida ishlab chiqaring
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">Tavsiya etiladi</p>
                      <p className="text-base sm:text-lg font-bold">{Math.ceil(forecast.avgDailyDemand * 30)} qop</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
