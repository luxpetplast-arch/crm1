import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import api from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function InventoryAI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [risks, setRisks] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysesRes, risksRes, recsRes] = await Promise.all([
        api.get('/inventory-ai/analyze-all'),
        api.get('/inventory-ai/risks'),
        api.get('/inventory-ai/recommendations')
      ]);
      
      setAnalyses(analysesRes.data);
      setRisks(risksRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error('AI tahlilni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">AI tahlil qilinmoqda...</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'INCREASING') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'DECREASING') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="w-4 h-4 text-gray-600">→</span>;
  };

  const getRiskBadge = (risk: string) => {
    if (risk === 'HIGH') return <Badge variant="danger">Yuqori</Badge>;
    if (risk === 'MEDIUM') return <Badge variant="warning">O'rta</Badge>;
    return <Badge variant="success">Past</Badge>;
  };

  const getDataQualityBadge = (quality: string) => {
    if (quality === 'EXCELLENT') return <Badge variant="success">A'lo</Badge>;
    if (quality === 'GOOD') return <Badge variant="info">Yaxshi</Badge>;
    if (quality === 'FAIR') return <Badge variant="warning">O'rtacha</Badge>;
    return <Badge variant="danger">Kam</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            AI Ombor Optimizatori
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Sun'iy intellekt yordamida optimal zaxira boshqaruvi
          </p>
        </div>
        <Button onClick={loadData} size="lg" className="w-full sm:w-auto">
          <RefreshCw className="w-5 h-5 mr-2" />
          Yangilash
        </Button>
      </div>

      {/* Xavflar Statistikasi */}
      {risks && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tugash Xavfi (Yuqori)</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {risks.highStockoutRisk?.length || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tugash Xavfi (O'rta)</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                    {risks.mediumStockoutRisk?.length || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ortiqcha Zaxira</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {risks.highOverstockRisk?.length || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Buyurtma Kerak</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {risks.needsReorder?.length || 0}
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Buyurtma Tavsiyalari */}
      {recommendations.length > 0 && (
        <Card className="border-2 border-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              AI Buyurtma Tavsiyalari
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                    rec.urgency === 'HIGH' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : rec.urgency === 'MEDIUM'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">{rec.productName}</h3>
                        {getRiskBadge(rec.urgency)}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{rec.reason}</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 text-xs sm:text-sm">
                        <span>Joriy: <strong>{formatNumber(rec.currentStock)} qop</strong></span>
                        <span>Buyurtma: <strong className="text-purple-600">{formatNumber(rec.recommendedOrder)} qop</strong></span>
                        <span>Xarajat: <strong className="text-green-600">{formatCurrency(rec.estimatedCost, 'USD')}</strong></span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/products/${rec.productId}`)}
                      className="w-full sm:w-auto"
                    >
                      Buyurtma
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barcha Mahsulotlar Tahlili */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Barcha Mahsulotlar AI Tahlili</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div 
                key={analysis.productId}
                className="p-3 sm:p-4 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setSelectedProduct(analysis)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base">{analysis.productName}</h3>
                      {getTrendIcon(analysis.salesTrend)}
                      {getDataQualityBadge(analysis.dataQuality)}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Joriy Zaxira</p>
                        <p className="font-semibold">{formatNumber(analysis.currentStock)} qop</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kunlik Sotuv</p>
                        <p className="font-semibold">{formatNumber(analysis.averageDailySales, 1)} qop</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Optimal</p>
                        <p className="font-semibold text-green-600">{formatNumber(analysis.recommendedOptimalStock)} qop</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AI Ishonch</p>
                        <p className="font-semibold text-purple-600">{formatNumber(analysis.confidenceScore)}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs">Tugash: {getRiskBadge(analysis.stockoutRisk)}</span>
                      <span className="text-xs">Ortiqcha: {getRiskBadge(analysis.overstockRisk)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(analysis);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Batafsil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batafsil Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">{selectedProduct.productName}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">AI Batafsil Tahlil</p>
                </div>
                <Button onClick={() => setSelectedProduct(null)} variant="outline" size="sm">
                  Yopish
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Asosiy Ko'rsatkichlar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Joriy Zaxira</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatNumber(selectedProduct.currentStock)}</p>
                  <p className="text-xs text-muted-foreground">qop</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Optimal</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{formatNumber(selectedProduct.recommendedOptimalStock)}</p>
                  <p className="text-xs text-muted-foreground">qop</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">AI Ishonch</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatNumber(selectedProduct.confidenceScore)}%</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct.dataQuality}</p>
                </div>
              </div>

              {/* Sotuvlar Tahlili */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sotuvlar Tahlili
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Kunlik O'rtacha</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedProduct.averageDailySales, 1)} qop</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Haftalik O'rtacha</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedProduct.averageWeeklySales, 1)} qop</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Oylik O'rtacha</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedProduct.averageMonthlySales, 1)} qop</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <span className="text-sm">Trend:</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(selectedProduct.salesTrend)}
                    <span className="font-semibold">{selectedProduct.salesTrend}</span>
                    <span className={`text-sm ${selectedProduct.trendPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedProduct.trendPercentage > 0 ? '+' : ''}{formatNumber(selectedProduct.trendPercentage, 1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Tavsiyalar */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Zaxira Tavsiyal ari
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm font-semibold">Minimal Zaxira</p>
                    <p className="text-2xl font-bold">{formatNumber(selectedProduct.recommendedMinStock)} qop</p>
                    <p className="text-xs text-muted-foreground mt-1">5 kunlik sotuv + xavfsizlik</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm font-semibold">Optimal Zaxira</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(selectedProduct.recommendedOptimalStock)} qop</p>
                    <p className="text-xs text-muted-foreground mt-1">10 kunlik sotuv + xavfsizlik</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-semibold">Maksimal Zaxira</p>
                    <p className="text-2xl font-bold">{formatNumber(selectedProduct.recommendedMaxStock)} qop</p>
                    <p className="text-xs text-muted-foreground mt-1">20 kunlik sotuv + xavfsizlik</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm font-semibold">Buyurtma Nuqtasi</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(selectedProduct.reorderPoint)} qop</p>
                    <p className="text-xs text-muted-foreground mt-1">Buyurtma: {formatNumber(selectedProduct.reorderQuantity)} qop</p>
                  </div>
                </div>
              </div>

              {/* Ogohlantirishlar */}
              {selectedProduct.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Ogohlantirishlar
                  </h3>
                  <div className="space-y-2">
                    {selectedProduct.warnings.map((warning: string, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-sm">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tavsiyalar */}
              {selectedProduct.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    AI Tavsiyalari
                  </h3>
                  <div className="space-y-2">
                    {selectedProduct.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mavsumiy Ma'lumot */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Mavsumiy Tahlil
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Mavsumiy Koeffitsient</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedProduct.seasonalFactor, 2)}x</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Eng Ko'p Sotiluvchi</p>
                    <p className="text-lg font-semibold">{selectedProduct.peakSeason}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Eng Kam Sotiluvchi</p>
                    <p className="text-lg font-semibold">{selectedProduct.lowSeason}</p>
                  </div>
                </div>
              </div>

              {/* Xavflar */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Xavflar Baholash
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Tugash Xavfi</p>
                    {getRiskBadge(selectedProduct.stockoutRisk)}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Ortiqcha Zaxira Xavfi</p>
                    {getRiskBadge(selectedProduct.overstockRisk)}
                  </div>
                </div>
              </div>

              {/* Moliyaviy */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Moliyaviy Tahlil
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Joriy Zaxira Qiymati</p>
                    <p className="text-xl font-bold">{formatCurrency(selectedProduct.estimatedCost, 'USD')}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Potentsial Tejash</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedProduct.potentialSavings, 'USD')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
