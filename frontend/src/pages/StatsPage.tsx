import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1e1e2e', border: '1px solid #2d2d44', borderRadius: '8px', color: '#ffffff' },
  labelStyle: { color: '#ffffff' },
};

const StatsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLanguage();
  const { user } = useAuth();

  // Share functionality
  const handleShare = async () => {
    const url = `${window.location.origin}/stats/${activeTab}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Failed to copy link
    }
  };

  // URL synchronization
  useEffect(() => {
    if (tab && tab !== activeTab) {
      const validTabs = ['overview', 'drivers', 'constructors', 'accuracy', 'circuits', 'users', 'progress'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      } else {
        navigate('/stats/overview', { replace: true });
      }
    }
  }, [tab, activeTab, navigate]);

  useEffect(() => {
    if (activeTab && activeTab !== 'overview' && !tab) {
      navigate(`/stats/${activeTab}`, { replace: true });
    }
  }, [activeTab, tab, navigate]);

  useEffect(() => {
    if (!user && activeTab === 'users') {
      setActiveTab('overview');
      navigate('/stats/overview', { replace: true });
    }
  }, [user, activeTab, navigate]);

  // Data fetching — only fetch when tab is active
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: api.getStatsOverview,
    enabled: activeTab === 'overview',
  });

  const { data: driverStats, isLoading: driverLoading } = useQuery({
    queryKey: ['stats', 'driver-performance'],
    queryFn: api.getDriverPerformanceStats,
    enabled: activeTab === 'drivers',
  });

  const { data: constructorStats, isLoading: constructorLoading } = useQuery({
    queryKey: ['stats', 'constructor-performance'],
    queryFn: api.getConstructorPerformanceStats,
    enabled: activeTab === 'constructors',
  });

  const { data: predictionAccuracy, isLoading: accuracyLoading } = useQuery({
    queryKey: ['stats', 'prediction-accuracy'],
    queryFn: api.getPredictionAccuracyStats,
    enabled: activeTab === 'accuracy',
  });

  const { data: circuitStats, isLoading: circuitLoading } = useQuery({
    queryKey: ['stats', 'circuit-difficulty'],
    queryFn: api.getCircuitDifficultyStats,
    enabled: activeTab === 'circuits',
  });

  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['stats', 'user-comparison'],
    queryFn: api.getUserComparisonStats,
    enabled: activeTab === 'users' && !!user,
  });

  const { data: seasonProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['stats', 'season-progress'],
    queryFn: api.getSeasonProgressStats,
    enabled: activeTab === 'progress',
  });

  const tabs = [
    { id: 'overview', name: t('stats.overview') },
    { id: 'drivers', name: t('stats.driverPerformance') },
    { id: 'constructors', name: t('stats.constructorPerformance') },
    { id: 'accuracy', name: t('stats.predictionAccuracy') },
    { id: 'circuits', name: t('stats.circuitDifficulty') },
    ...(user ? [{ id: 'users', name: t('stats.userComparison') }] : []),
    { id: 'progress', name: t('stats.seasonProgress') },
  ];

  const renderLoading = (message: string) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-f1-red mx-auto"></div>
        <p className="mt-2 text-slate-400">{message}</p>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">{t('stats.totalUsers')}</p>
              <p className="text-2xl font-bold text-white">{overview?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-2xl">🏁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">{t('stats.completedRaces')}</p>
              <p className="text-2xl font-bold text-white">{overview?.completedRaces || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">{t('stats.totalPredictions')}</p>
              <p className="text-2xl font-bold text-white">{overview?.totalPredictions || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-f1-red/20 border border-f1-red/30 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">{t('stats.averageScore')}</p>
              <p className="text-2xl font-bold text-white">
                {overview?.averageScore ? Number(overview.averageScore).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {overview?.mostPredictedDriver && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.mostPredictedDriver')}</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-f1-surface-elevated rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{overview.mostPredictedDriver.driverCode}</span>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{overview.mostPredictedDriver.driverName}</p>
              <p className="text-slate-400">{t('stats.driverCode')}: {overview.mostPredictedDriver.driverCode}</p>
            </div>
          </div>
        </div>
      )}

      {(!overview || overview.totalPredictions === 0) && !overviewLoading && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2 text-white">{t('stats.noDataAvailable')}</h3>
          <p className="text-slate-400">{t('stats.startPredicting')}</p>
        </div>
      )}
    </div>
  );

  const renderDriverPerformance = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.driverSuccessRates')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={driverStats?.driverStats?.slice(0, 10) || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis dataKey="driverCode" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.successRate')]} />
            <Bar dataKey="successRate" fill="#e10600" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.podiumFinishes')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="driverCode" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="podiumFinishes" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.totalPredictionsPerDriver')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="driverCode" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPredictionAccuracy = () => {
    const accuracyData = predictionAccuracy?.accuracyByType ?
      Object.entries(predictionAccuracy.accuracyByType).map(([type, data]) => {
        const typed = data as { accuracy: number; correctPredictions: number; totalPredictions: number };
        return {
          type: t(`stats.${type}`),
          accuracy: typed.accuracy,
          correct: typed.correctPredictions,
          total: typed.totalPredictions
        };
      }) : [];

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.predictionAccuracyByType')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="type" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill="#e10600" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.accuracyRadarChart')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={accuracyData}>
              <PolarGrid stroke="#2d2d44" />
              <PolarAngleAxis dataKey="type" stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
              <Radar name={t('stats.accuracy')} dataKey="accuracy" stroke="#e10600" fill="#e10600" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCircuitDifficulty = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.circuitDifficultyLowerAccuracy')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={circuitStats?.circuitStats || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.difficulty')]} />
            <Bar dataKey="difficulty" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.circuitAccuracy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.predictionsPerCircuit')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderUserComparison = () => {
    if (!user) {
      return (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2 text-white">Inloggen Vereist</h3>
          <p className="text-slate-400">Je moet ingelogd zijn om gebruiker vergelijkingen te bekijken.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.userTotalScores')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={userStats?.userStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="userName" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalScore" fill="#e10600" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.userAccuracy')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats?.userStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
                <XAxis dataKey="userName" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
                <Bar dataKey="accuracy" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.averageScorePerUser')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats?.userStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
                <XAxis dataKey="userName" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="averageScore" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderSeasonProgress = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.seasonProgressAccuracy')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={seasonProgress?.raceProgress || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis dataKey="raceName" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Line type="monotone" dataKey="accuracy" stroke="#e10600" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.averageScoreProgression')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={seasonProgress?.raceProgress || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis dataKey="raceName" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="averageScore" stroke="#e10600" fill="#e10600" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderConstructorPerformance = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.constructorSuccessRates')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={constructorStats?.constructorStats || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis dataKey="constructorName" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.successRate')]} />
            <Bar dataKey="successRate" fill="#e10600" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.correctPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="constructorName" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="correctPredictions" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.totalPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis dataKey="constructorName" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return overviewLoading ? renderLoading(t('stats.loadingOverview')) : renderOverview();
      case 'drivers':
        return driverLoading ? renderLoading(t('stats.loadingDriverStatistics')) : renderDriverPerformance();
      case 'accuracy':
        return accuracyLoading ? renderLoading(t('common.loading')) : renderPredictionAccuracy();
      case 'circuits':
        return circuitLoading ? renderLoading(t('common.loading')) : renderCircuitDifficulty();
      case 'users':
        return userLoading ? renderLoading(t('common.loading')) : renderUserComparison();
      case 'progress':
        return progressLoading ? renderLoading(t('common.loading')) : renderSeasonProgress();
      case 'constructors':
        return constructorLoading ? renderLoading(t('common.loading')) : renderConstructorPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto py-2">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-f1">
              <span className="text-f1-red">F1</span> Chatter Statistieken
            </h1>
            <p className="text-slate-400">{t('stats.subtitle')}</p>
          </div>
          <button
            onClick={handleShare}
            className="btn btn-primary"
            title={t('stats.shareThisStat')}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            {t('stats.shareThisStat')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-f1-surface rounded-lg border border-f1-border mb-8 checkered-bg">
          <div className="border-b border-f1-border">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    setActiveTab(tabItem.id);
                    navigate(`/stats/${tabItem.id}`);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap uppercase tracking-f1 transition-colors ${
                    activeTab === tabItem.id
                      ? 'border-f1-red text-f1-red'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-f1-border'
                  }`}
                >
                  {tabItem.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default StatsPage;
