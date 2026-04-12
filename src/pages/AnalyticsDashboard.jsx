import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  Activity,
  MapPin,
  Database,
  BarChart3,
  Leaf,
  ShieldCheck,
  Server,
  Download,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  Wrench,
  Calendar,
} from 'lucide-react';
import HeatmapTracker from '@/components/analytics/HeatmapTracker';
import {
  getHeatmapData,
  getBeachPrediction,
  refreshHeatmap,
} from '@/api/heatmapApi';
import { getActiveCarbonConfig } from '@/api/carbonConfigApi';
import {
  getDashboardOverview,
  getWasteByPlasticType,
  getCarbonOffsetSummary,
  getSeverityRanking,
  getTrendPrediction,
  exportAnalyticsJSON,
  exportAnalyticsCSV,
  getMLHealth,
  recalculateSeverity,
  recalculateCarbonOffsets,
} from '@/api/analyticsApi';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [data, setData] = useState(null);
  const [carbonConfig, setCarbonConfig] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [plasticRanking, setPlasticRanking] = useState([]);

  // Phase 6 States
  const [mlHealth, setMlHealth] = useState(true);
  const [severityRanking, setSeverityRanking] = useState([]);
  const [carbonSummary, setCarbonSummary] = useState(null);
  const [trendPrediction, setTrendPrediction] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBeachHeatmap, setSelectedBeachHeatmap] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [dateFilter, setDateFilter] = useState('all-time');
  const [currentDateString, setCurrentDateString] = useState('');

  // Set today's date once on mount
  useEffect(() => {
    const d = new Date();
    setCurrentDateString(
      d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  const getDateRange = (filter) => {
    if (filter === 'this-month') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: new Date().toISOString() };
    }
    if (filter === 'last-month') {
      const end = new Date();
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    return { start: undefined, end: undefined }; // all time
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const health = await getMLHealth();
        if (isMounted) setMlHealth(health);

        const { start, end } = getDateRange(dateFilter);

        const [
          heatmapRes,
          carbonRes,
          dashRes,
          plasticRes,
          severityRes,
          carbonSumRes,
          trendRes,
        ] = await Promise.all([
          getHeatmapData().catch(() => null),
          getActiveCarbonConfig().catch(() => null),
          getDashboardOverview(start, end).catch(() => null),
          getWasteByPlasticType().catch(() => null),
          getSeverityRanking(10).catch(() => null),
          getCarbonOffsetSummary(start, end).catch(() => null),
          getTrendPrediction().catch(() => null),
        ]);

        if (!isMounted) return;

        if (heatmapRes?.success) setData(heatmapRes.data.heatmap);
        // Don't set a hard error if heatmap fails — other sections can still render

        if (carbonRes?.success) setCarbonConfig(carbonRes.data.config);
        if (dashRes?.success) setGlobalStats(dashRes.data.dashboard.summary);
        if (plasticRes?.success)
          setPlasticRanking(plasticRes.data.plasticTypeData || []);
        if (severityRes?.success)
          setSeverityRanking(severityRes.data.ranking || []);

        // Carbon offset summary — guard against null response
        if (carbonSumRes?.success && carbonSumRes.data?.summary) {
          const s = carbonSumRes.data.summary;
          // Backend returns either the aggregate object or a zero-fill default
          setCarbonSummary({
            totalCarbonOffset: s.totalCarbonOffset ?? 0,
            totalWasteWeight: s.totalWasteWeight ?? 0,
            averageCarbonPerKg: s.averageCarbonPerKg ?? 0,
          });
        }

        // Trend prediction — the inner `prediction` object can itself have success:false
        if (trendRes?.success && trendRes.data?.prediction?.success === true) {
          setTrendPrediction(trendRes.data.prediction);
        }
      } catch (err) {
        if (isMounted)
          setError(err.message || 'Error fetching analytics dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [dateFilter]);

  // Compute chart data and highest-risk beach from heatmap predictions
  const { chartData, highestRiskBeach, rawBeaches } = useMemo(() => {
    if (!data || !data.predictions || data.predictions.length === 0) {
      return { chartData: [], highestRiskBeach: null, rawBeaches: [] };
    }

    const { predictions } = data;

    let maxRiskScore = -1;
    let peakRiskBeach = null;

    // Format data for a multi-line chart: [{ date, 'Beach A': score, 'Beach B': score }]
    const dateMap = {};

    predictions.forEach((beachItem) => {
      const bName = beachItem.beachName || 'Unknown Beach';
      let maxRiskyForBeach = -1;

      const forecastData = beachItem.forecast || [];
      forecastData.forEach((p) => {
        if (!dateMap[p.date]) dateMap[p.date] = { date: p.date };
        dateMap[p.date][bName] = p.riskScore;

        if (p.riskScore > maxRiskyForBeach) maxRiskyForBeach = p.riskScore;
      });

      if (maxRiskyForBeach > maxRiskScore) {
        maxRiskScore = maxRiskyForBeach;
        peakRiskBeach = bName;
      }
    });

    const sortedChartData = Object.values(dateMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      chartData: sortedChartData,
      highestRiskBeach: {
        name: peakRiskBeach,
        score: maxRiskScore >= 0 ? maxRiskScore.toFixed(1) : '0',
      },
      rawBeaches: predictions,
    };
  }, [data]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      const res =
        format === 'csv'
          ? await exportAnalyticsCSV()
          : await exportAnalyticsJSON();

      if (res?.success) {
        if (format === 'json') {
          const dataStr =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(res.data.exportData, null, 2));
          const dl = document.createElement('a');
          dl.setAttribute('href', dataStr);
          dl.setAttribute(
            'download',
            `ecoshore_analytics_${new Date().toISOString().split('T')[0]}.json`
          );
          document.body.appendChild(dl);
          dl.click();
          dl.remove();
        } else if (format === 'csv') {
          const headers = res.data.headers.join(',');
          const rows = res.data.data
            .map((obj) => Object.values(obj).join(','))
            .join('\n');
          const csvContent =
            'data:text/csv;charset=utf-8,' + headers + '\n' + rows;
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute(
            'download',
            `ecoshore_analytics_${new Date().toISOString().split('T')[0]}.csv`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export analytics data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBeachClick = async (beachId) => {
    try {
      if (!beachId) return;
      const res = await getBeachPrediction(beachId);
      if (res?.success) {
        setSelectedBeachHeatmap(res.data.prediction);
      }
    } catch (err) {
      console.error('Failed to load specific beach prediction:', err);
    }
  };

  const handleAdminRecalculate = async (type) => {
    try {
      setIsRecalculating(true);
      setAdminStatus(null);
      const res =
        type === 'severity'
          ? await recalculateSeverity()
          : await recalculateCarbonOffsets();

      if (res?.success) {
        setAdminStatus({
          type: 'success',
          message:
            res.message ||
            'Recalculation complete! Refresh the page to see updated values.',
        });
        // Re-fetch dashboard data after recalculation
        const [dashRes, severityRes, carbonSumRes] = await Promise.all([
          getDashboardOverview().catch(() => null),
          getSeverityRanking(10).catch(() => null),
          getCarbonOffsetSummary().catch(() => null),
        ]);
        if (dashRes?.success) setGlobalStats(dashRes.data.dashboard.summary);
        if (severityRes?.success)
          setSeverityRanking(severityRes.data.ranking || []);
        if (carbonSumRes?.success && carbonSumRes.data?.summary) {
          const s = carbonSumRes.data.summary;
          setCarbonSummary({
            totalCarbonOffset: s.totalCarbonOffset ?? 0,
            totalWasteWeight: s.totalWasteWeight ?? 0,
            averageCarbonPerKg: s.averageCarbonPerKg ?? 0,
          });
        }
      } else {
        setAdminStatus({
          type: 'error',
          message: 'Recalculation failed. Check backend logs.',
        });
      }
    } catch (err) {
      setAdminStatus({
        type: 'error',
        message: err.message || 'Recalculation failed.',
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          </div>
          {/* KPI Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl h-32 flex items-center space-x-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          {/* Main Chart Skeleton */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl h-[450px] border border-gray-100 dark:border-gray-700">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="h-full w-full bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.includes('401') || error.toLowerCase().includes('unauthorized');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl shadow-lg border border-red-100 dark:border-red-800 flex flex-col items-center max-w-md text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {isAuthError
              ? 'Authentication Required'
              : 'Failed to load analytics'}
          </h2>
          <p>
            {isAuthError
              ? 'Please log in with an authorized account to securely access the AI prediction data.'
              : error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Config */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">{currentDateString}</span>
            </div>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Complete overview of environmental impact, global statistics, and
              AI forecasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="all-time">All-Time Statistics</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
            </select>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> CSV Report
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Server className="w-4 h-4" /> JSON Export
            </button>
          </div>
        </div>

        {/* KPI Section — always renders; shows '---' placeholders when data hasn't loaded */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI 1: Total Plastics Collected */}
          <div className="group hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Plastics Collected
              </p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {globalStats?.totalWasteCollected != null
                  ? `${Number(globalStats.totalWasteCollected).toLocaleString()} kg`
                  : '---'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All-time · from waste records
              </p>
            </div>
          </div>

          {/* KPI 2: Total Beaches Cleaned */}
          <div className="group hover:-translate-y-1 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-orange-500/5 border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Beaches Cleaned
              </p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {globalStats?.totalBeaches ?? '---'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All-time · beaches with records
              </p>
            </div>
          </div>

          {/* KPI 3: Total Events Done */}
          <div className="group hover:-translate-y-1 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Events Done
              </p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {globalStats?.totalCleanups ?? '---'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All-time · all events in system
              </p>
            </div>
          </div>
        </div>

        {/* Admin Tools Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Tools
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recalculate derived metrics from raw database records
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAdminRecalculate('severity')}
                disabled={isRecalculating}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-semibold text-sm rounded-xl border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`}
                />
                Recalculate Severity Scores
              </button>
              <button
                onClick={() => handleAdminRecalculate('carbon')}
                disabled={isRecalculating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold text-sm rounded-xl border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`}
                />
                Recalculate Carbon Offsets
              </button>
              <button
                onClick={async () => {
                  setIsRecalculating(true);
                  try {
                    const res = await refreshHeatmap();
                    if (res?.success) {
                      setAdminStatus({
                        type: 'success',
                        message: 'Map data refreshed! Reloading...',
                      });
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      setAdminStatus({
                        type: 'error',
                        message: 'Heatmap refresh failed.',
                      });
                    }
                  } catch (e) {
                    setAdminStatus({
                      type: 'error',
                      message: 'Error refreshing heatmap.',
                    });
                  } finally {
                    setIsRecalculating(false);
                  }
                }}
                disabled={isRecalculating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-sm rounded-xl border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`}
                />
                Refresh Live Map Data
              </button>
            </div>
          </div>
          {adminStatus && (
            <div
              className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${adminStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'}`}
            >
              {adminStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {adminStatus.message}
            </div>
          )}
        </div>

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
                The model predicts that <strong>{highestRiskBeach.name}</strong>{' '}
                will reach the highest risk level with a peak score of{' '}
                <strong>{highestRiskBeach.score}</strong>. Clean-up crews and
                volunteers should prioritize this location within the next 7
                days.
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartData && chartData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              7-Day Predictive Risk Heatmap
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              * The AI model calculates its predictive result dynamically by
              combining total waste volume trends, historical tourist footprint,
              and seasonal weather/monsoon rain impact.
            </p>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    className="opacity-50 dark:opacity-20"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                    itemStyle={{ color: '#1f2937', fontWeight: 500 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {/* Generate lines dynamically based on available beaches */}
                  {Object.keys(chartData[0])
                    .filter((key) => key !== 'date')
                    .map((beachName, index) => {
                      const colors = [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#ec4899',
                        '#14b8a6',
                      ];
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
                      );
                    })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No predictions available at the moment. Please check the backend
              ML service.
            </p>
          </div>
        )}

        {/* Layout Grid for Leaderboard & Carbon Config */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Severity Ranking Leaderboard */}
          <div className="lg:col-span-12 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Actionable Insights
                </h3>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Rank</th>
                    <th className="px-4 py-3">Beach Name</th>
                    <th className="px-4 py-3">Severity Score</th>
                    <th className="px-4 py-3">Carbon Offset</th>
                    <th className="px-4 py-3 rounded-r-lg">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {(severityRanking || []).map((beach, idx) => (
                    <tr
                      key={beach.beachId || beach.name}
                      onClick={() => handleBeachClick(beach.beachId)}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                      title="Click to view detailed predictive insights"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {beach.name}{' '}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          ({beach.city})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold leading-none ${
                              beach.severityScore >= 75
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                : beach.severityScore >= 50
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                  : beach.severityScore >= 25
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                            }`}
                          >
                            {Number(beach.severityScore).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">
                        {beach.totalCarbonOffset} kg CO₂
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            beach.severityLevel === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : beach.severityLevel === 'HIGH'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                : beach.severityLevel === 'MODERATE'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {beach.severityLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!severityRanking || severityRanking.length === 0) && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        No severity metrics computed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plastics Type Ranking */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Plastics Collected Ranking
            </h3>
            <div className="h-[280px] w-full mt-4">
              {plasticRanking && plasticRanking.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plasticRanking.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="totalWeight"
                      nameKey="plasticType"
                      stroke="none"
                    >
                      {plasticRanking.slice(0, 5).map((entry, index) => {
                        const PLASTIC_COLORS = [
                          '#10b981',
                          '#3b82f6',
                          '#f59e0b',
                          '#ef4444',
                          '#8b5cf6',
                        ];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={PLASTIC_COLORS[index % PLASTIC_COLORS.length]}
                          />
                        );
                      })}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => [
                        `${value.toFixed(1)} kg`,
                        'Weight',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No plastic data available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carbon Config & Map Layout Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carbon Config & Summary Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 text-white relative flex flex-col justify-between hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Carbon Offset Impact</h3>
                <Leaf className="text-emerald-400 w-6 h-6" />
              </div>

              {carbonSummary && (
                <div className="mb-6 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-500/20">
                  <p className="text-sm text-emerald-100 mb-1">
                    Total Carbon Offset
                  </p>
                  <h4 className="text-4xl font-black text-emerald-400">
                    {carbonSummary.totalCarbonOffset.toLocaleString()}{' '}
                    <span className="text-lg font-semibold text-emerald-200">
                      kg CO₂
                    </span>
                  </h4>

                  <div className="flex gap-4 mt-3">
                    <div>
                      <p className="text-xs text-emerald-200/60">
                        Waste Processed
                      </p>
                      <p className="font-semibold text-emerald-100">
                        {carbonSummary.totalWasteWeight.toLocaleString()} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-200/60">Avg Offset</p>
                      <p className="font-semibold text-emerald-100">
                        {carbonSummary.averageCarbonPerKg.toFixed(2)} kg/kg
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-400 text-sm mb-4">
                Current environmental parameters used by the EcoShore
                measurement system.
              </p>

              {carbonConfig ? (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-sm text-gray-300">Emission Factor</p>
                    <p className="text-xl font-bold tracking-tight">
                      {carbonConfig.emissionFactor}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Config: {carbonConfig.name} (v{carbonConfig.version})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                  <p className="text-gray-400 text-sm">
                    No active carbon configuration found.
                  </p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-xs text-gray-400 leading-tight">
                * Carbon offset equivalents assume every 10kg prevented equals 1
                tree planted.
              </p>
            </div>
          </div>

          {/* Map & Trend Prediction Section Layout */}
          <div className="lg:col-span-2 space-y-8">
            {/* Waste Volume Trend Chart */}
            {trendPrediction && trendPrediction.predictions && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" />
                  Statistical Waste Volume Forecast (Next 3 Months)
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendPrediction.predictions}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="opacity-50 dark:opacity-20"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '12px' }}
                      />
                      <Bar
                        name="Predicted Waste Volume (kg)"
                        dataKey="predictedWeight"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        name="Expected Carbon Offset (kg CO2)"
                        dataKey="predictedCarbonOffset"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Map Tracker */}
            {rawBeaches && rawBeaches.length > 0 && (
              <HeatmapTracker beaches={rawBeaches} />
            )}
          </div>
        </div>
      </div>

      {/* Modal for Specific Beach Prediction */}
      {selectedBeachHeatmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="text-emerald-500" />
                {selectedBeachHeatmap.beachName || 'Beach Insight'}
              </h3>
              <button
                onClick={() => setSelectedBeachHeatmap(null)}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                Detailed 7-day risk breakdown for{' '}
                {selectedBeachHeatmap.beachName}. Current severity score is
                dynamically calculated through recent ML projections.
              </p>

              {selectedBeachHeatmap.forecast &&
              selectedBeachHeatmap.forecast.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedBeachHeatmap.forecast}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="opacity-50 dark:opacity-20"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px' }}
                      />
                      <Line
                        type="monotone"
                        name="Predicted Risk Score"
                        dataKey="riskScore"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No forecast data available for this specific beach.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-right">
              <button
                onClick={() => setSelectedBeachHeatmap(null)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition"
              >
                Close Insight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
