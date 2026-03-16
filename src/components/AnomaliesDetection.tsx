import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface AnomaliesDetectionProps {
  anomalies: any[];
}

export default function AnomaliesDetection({ anomalies }: AnomaliesDetectionProps) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Anomaliyalar Aniqlash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-600">Barcha Normal!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Daromadda g'ayritabiiy o'zgarishlar aniqlanmadi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Anomaliyalar Aniqlash
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                anomaly.type === 'spike' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-red-500 bg-red-50 dark:bg-red-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {anomaly.type === 'spike' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      {anomaly.type === 'spike' ? '📈 Daromad Sakrashi' : '📉 Daromad Pasayishi'}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      anomaly.severity === 'high' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {anomaly.severity === 'high' ? 'YUQORI' : 'O\'RTA'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {anomaly.message}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-background rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Sana</p>
                      <p className="text-sm font-semibold">{anomaly.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Haqiqiy</p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(anomaly.value, 'USD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kutilgan</p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(anomaly.expected, 'USD')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Og'ish: {anomaly.deviation}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
