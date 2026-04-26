import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function DebugCharts() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Test dashboard API
        const dashboardRes = await api.get('/dashboard/stats');
        console.log('Dashboard data:', dashboardRes.data);
        setDashboardData(dashboardRes.data);

        // Test statistics API
        const statsRes = await api.get('/statistics/comprehensive?days=30');
        console.log('Statistics data:', statsRes.data);
        setStatisticsData(statsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chart Debug Ma'lumotlari</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Dashboard Data</h2>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-2 rounded">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Statistics Data</h2>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-2 rounded">
            {JSON.stringify(statisticsData, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Weekly Trend Check</h2>
        <p>weeklyTrend mavjud: {dashboardData?.weeklyTrend ? 'Ha' : 'Yo\'q'}</p>
        <p>weeklyTrend uzunligi: {dashboardData?.weeklyTrend?.length || 0}</p>
        {dashboardData?.weeklyTrend && (
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(dashboardData.weeklyTrend, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Statistics Trends Check</h2>
        <p>trends.daily mavjud: {statisticsData?.trends?.daily ? 'Ha' : 'Yo\'q'}</p>
        <p>trends.daily uzunligi: {statisticsData?.trends?.daily?.length || 0}</p>
        {statisticsData?.trends?.daily && (
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(statisticsData.trends.daily.slice(0, 3), null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
