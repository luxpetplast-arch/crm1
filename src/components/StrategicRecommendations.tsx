import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Lightbulb, TrendingUp, Shield, DollarSign, Users, Zap } from 'lucide-react';

interface StrategicRecommendationsProps {
  recommendations: any[];
}

export default function StrategicRecommendations({ recommendations }: StrategicRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growth': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'retention': return <Users className="w-5 h-5 text-blue-500" />;
      case 'efficiency': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'pricing': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'risk': return <Shield className="w-5 h-5 text-red-500" />;
      default: return <Lightbulb className="w-5 h-5 text-orange-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <Card className="border-2 border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-purple-500" />
          Strategik Tavsiyalar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(rec.category)}
                  <div>
                    <h4 className="font-bold text-lg">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(rec.priority)}`}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-sm font-semibold">🎯 Amallar:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {rec.actions.map((action: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{action}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Kutilayotgan Ta'sir</p>
                  <p className="text-sm font-semibold text-green-600">{rec.expectedImpact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vaqt Oralig'i</p>
                  <p className="text-sm font-semibold text-blue-600">{rec.timeframe}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
