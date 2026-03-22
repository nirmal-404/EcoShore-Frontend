import React, { useEffect, useState, useMemo } from 'react';
import { getHeatmapData } from '@/api/heatmapApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertCircle, Waves, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getHeatmapData();
        if (res?.success) {
          setData(res.data.heatmap);
        } else {
          setError(res?.message || 'Failed to fetch predictions');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute top level KPIs and format chart data
  const { kpis, chartData, highestRiskBeach } = useMemo(() => {
    if (!data || !data.predictions || data.predictions.length === 0) {
      return { kpis: null, chartData: [], highestRiskBeach: null };
    }

    const { predictions, beachCount } = data;
    
    let totalRisk = 0;
    let predictionCount = 0;
    let highRiskCount = 0;
    let maxRiskScore = -1;
    let peakRiskBeach = null;

    // We want to format the data for a multi-line chart (dates on X-axis, beaches as lines)
    // Structure: [{ date: '2026-03-22', 'Galle Face': 45, 'Unawatuna': 20, ... }]
    const dateMap = {};

    predictions.forEach(beachItem => {
      const bName = beachItem.beachName || 'Unknown Beach';
      
      let maxRiskyForBeach = -1;

      const forecastData = beachItem.forecast || [];
      forecastData.forEach(p => {
        // Build chart structure
        if (!dateMap[p.date]) {
          dateMap[p.date] = { date: p.date };
        }
        dateMap[p.date][bName] = p.riskScore;

        // KPI aggregates
        totalRisk += p.riskScore;
        predictionCount++;
        
        if (p.riskLevel === 'HIGH' || p.riskLevel === 'SEVERE') {
          highRiskCount++;
        }

        if (p.riskScore > maxRiskyForBeach) {
            maxRiskyForBeach = p.riskScore;
        }
      });

      if (maxRiskyForBeach > maxRiskScore) {
          maxRiskScore = maxRiskyForBeach;
          peakRiskBeach = bName;
      }
    });

    const averageRisk = predictionCount > 0 ? (totalRisk / predictionCount).toFixed(1) : 0;
    
    // Convert dateMap to sorted array
    const sortedChartData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get up to 5 beaches correctly formatted to prevent overcrowded charts
    const topBeaches = predictions.slice(0, 5).map(b => b.beachName);

    return {
      kpis: {
        beachCount,
        averageRisk,
        highRiskCount,
      },
      chartData: sortedChartData,
      highestRiskBeach: {
          name: peakRiskBeach,
          score: maxRiskScore.toFixed(1)
      },
      topBeaches
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-emerald-600 dark:text-emerald-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p className="font-medium animate-pulse">Loading predictive insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('401') || error.toLowerCase().includes('unauthorized');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl shadow-lg border border-red-100 dark:border-red-800 flex flex-col items-center max-w-md text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">{isAuthError ? 'Authentication Required' : 'Failed to load analytics'}</h2>
          <p>{isAuthError ? 'Please log in with an authorized account to securely access the AI prediction data.' : error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Config */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
              AI Prediction Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              7-day risk forecasting powered by real-time ML models and current beach conditions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Updates Active
          </div>
        </div>

        {/* KPI Section */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Analyzed Beaches</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpis.beachCount}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <Waves className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Risk Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpis.averageRisk}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Risk Days Detected</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpis.highRiskCount}</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actionable AI Insight */}
        {highestRiskBeach && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex items-center gap-6">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm hidden sm:block">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">AI Actionable Insight</h3>
                    <p className="text-emerald-50 leading-relaxed">
                        The model predicts that <strong>{highestRiskBeach.name}</strong> will reach the highest risk level with a peak score of <strong>{highestRiskBeach.score}</strong>. Clean-up crews and volunteers should prioritize this location within the next 7 days.
                    </p>
                </div>
            </div>
        )}

        {/* Charts Section */}
        {chartData && chartData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">7-Day Predictive Risk Heatmap</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="opacity-50 dark:opacity-20" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    }} 
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    itemStyle={{ color: '#1f2937', fontWeight: 500 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {/* Generate lines dynamically based on available beaches */}
                  {Object.keys(chartData[0])
                    .filter(key => key !== 'date')
                    .map((beachName, index) => {
                       const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
                       return (
                        <Line 
                          key={beachName} 
                          type="monotone" 
                          dataKey={beachName} 
                          stroke={colors[index % colors.length]} 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                       )
                    })
                  }
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No predictions available at the moment. Please check the backend ML service.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
