import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';

export default function BusinessAI() {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/business-ai/analyze');
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setError(err.response?.data?.message || 'Tahlilni yuklashda xatolik yuz berdi. Iltimos GEMINI_API_KEY sozlanganini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  // Format the analysis text (handle markdown-style sections)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('1. **') || line.startsWith('2. **') || line.startsWith('3. **') || line.startsWith('4. **') || line.startsWith('5. **')) {
        return <h3 key={i} className="text-xl font-black text-blue-600 mt-8 mb-4 flex items-center gap-2">
          {line.includes('Xulosa') && <BarChart3 className="w-6 h-6" />}
          {line.includes('Yutuqlar') && <TrendingUp className="w-6 h-6 text-emerald-500" />}
          {line.includes('Muammolar') && <AlertTriangle className="w-6 h-6 text-rose-500" />}
          {line.includes('Tavsiyalar') && <Lightbulb className="w-6 h-6 text-amber-500" />}
          {line.includes('Bashorat') && <Sparkles className="w-6 h-6 text-purple-500" />}
          {line.replace(/\*/g, '')}
        </h3>;
      }
      if (line.trim().startsWith('-')) {
        return <li key={i} className="ml-6 mb-2 text-gray-700 dark:text-gray-300 font-medium list-disc">{line.substring(1).trim()}</li>;
      }
      return <p key={i} className="mb-2 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{line}</p>;
    });
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[3rem] p-10 sm:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white dark:border-gray-800">
        <div className="absolute top-0 -left-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                <Brain className="w-3 h-3 animate-pulse" />
                Gemini AI Powered
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]">
                {latinToCyrillic("Biznes")}<br />
                <span className="text-blue-600">{latinToCyrillic("Tahlili")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold max-w-md text-sm sm:text-base">
                {latinToCyrillic("Gemini AI yordamida biznesingizni to'liq tahlil qiling va strategik tavsiyalar oling")}
              </p>
            </div>
            
            <Button 
              onClick={fetchAnalysis} 
              disabled={loading}
              className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? latinToCyrillic("TAHLIL QILINMOQDA...") : latinToCyrillic("QAYTA TAHLIL QILISH")}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {error ? (
          <Card className="border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30">
            <CardContent className="p-10 text-center">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-rose-600 mb-4">{latinToCyrillic("Xatolik!")}</h3>
              <p className="text-gray-600 dark:text-gray-400 font-bold mb-8">{error}</p>
              <Button onClick={fetchAnalysis} variant="secondary">{latinToCyrillic("Qayta urinish")}</Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/3 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-5/6"></div>
                  <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-10 sm:p-16">
              <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-50 dark:border-gray-800">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{latinToCyrillic("AI Ekspert Xulosasi")}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString()} holatiga ko'ra</p>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                {analysis ? formatText(analysis) : (
                  <div className="text-center py-20">
                    <Sparkles className="w-16 h-16 text-blue-200 mx-auto mb-6" />
                    <p className="text-gray-400 font-bold">{latinToCyrillic("Hozircha tahlil mavjud emas. Tugmani bosing.")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
