import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface RiskAssessmentProps {
  assessment: any;
}

export default function RiskAssessment({ assessment }: RiskAssessmentProps) {
  if (!assessment) return null;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-950';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-950';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-950';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-8 h-8 text-red-600" />;
      case 'medium': return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-8 h-8 text-green-600" />;
      default: return <Shield className="w-8 h-8 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-950';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: any = {
      financial: 'bg-red-500',
      customer: 'bg-blue-500',
      operational: 'bg-yellow-500',
      market: 'bg-purple-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Card className="border-2 border-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-500" />
          Xavf Baholash
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Risk Overview */}
        <div className={`p-6 rounded-lg mb-6 ${getRiskLevelColor(assessment.riskLevel)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getRiskIcon(assessment.riskLevel)}
              <div>
                <h3 className="text-2xl font-bold">
                  Xavf Darajasi: {assessment.riskLevel.toUpperCase()}
                </h3>
                <p className="text-sm mt-1">
                  Umumiy xavf balli: {assessment.riskScore}/100
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{assessment.totalRisks}</p>
              <p className="text-sm">Aniqlangan xavflar</p>
            </div>
          </div>
        </div>

        {/* Risk Details */}
        <div className="space-y-4">
          {assessment.risks.map((risk: any, index: number) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(risk.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getCategoryBadge(risk.category)}`}>
                      {risk.category.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      risk.severity === 'high' ? 'bg-red-600 text-white' :
                      risk.severity === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-background rounded">
                <p className="text-sm font-semibold mb-1">⚠️ Ta'sir:</p>
                <p className="text-sm text-muted-foreground">{risk.impact}</p>
              </div>

              <div className="mt-3 p-3 bg-background rounded">
                <p className="text-sm font-semibold mb-1">💡 Yechim:</p>
                <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
              </div>
            </div>
          ))}
        </div>

        {assessment.risks.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-600">Ajoyib!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Hozircha jiddiy xavflar aniqlanmadi
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
