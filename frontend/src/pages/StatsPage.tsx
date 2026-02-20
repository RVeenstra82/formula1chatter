import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import FacebookIcon from '../components/common/FacebookIcon';
import { api } from '../api/client';
import type { Race } from '../api/client';
import { getSeasonState } from '../utils/timeUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

const chartTheme = {
  grid: '#2d2d44',
  axis: '#64748b',
  axisLight: '#94a3b8',
  red: '#e10600',
  green: '#22c55e',
  gold: '#fbbf24',
  orange: '#f97316',
};

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1e1e2e', border: `1px solid ${chartTheme.grid}`, borderRadius: '8px', color: '#ffffff' },
  labelStyle: { color: '#ffffff' },
};

const StatsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLanguage();
  const { user, login, isLoading: isLoadingAuth } = useAuth();

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

  // Data fetching — overview loads on every tab to check completedRaces
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: api.getStatsOverview,
  });

  const { data: allRaces = [] } = useQuery<Race[]>({
    queryKey: ['races', 'all'],
    queryFn: () => api.getCurrentSeasonRaces(),
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

      {overview?.mostPredictedDriver && overview.totalPredictions > 0 && (
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="driverCode" stroke={chartTheme.axis} />
            <YAxis stroke={chartTheme.axis} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.successRate')]} />
            <Bar dataKey="successRate" fill={chartTheme.red} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.podiumFinishes')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="driverCode" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="podiumFinishes" fill={chartTheme.green} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.totalPredictionsPerDriver')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="driverCode" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill={chartTheme.gold} />
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
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="type" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill={chartTheme.red} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.accuracyRadarChart')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={accuracyData}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis dataKey="type" stroke={chartTheme.axisLight} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={chartTheme.axis} />
              <Radar name={t('stats.accuracy')} dataKey="accuracy" stroke={chartTheme.red} fill={chartTheme.red} fillOpacity={0.3} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke={chartTheme.axis} />
            <YAxis stroke={chartTheme.axis} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.difficulty')]} />
            <Bar dataKey="difficulty" fill={chartTheme.orange} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.circuitAccuracy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill={chartTheme.green} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.predictionsPerCircuit')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill={chartTheme.gold} />
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
          <h3 className="text-lg font-semibold mb-2 text-white">{t('predict.loginRequired')}</h3>
          <p className="text-slate-400">{t('stats.loginRequired')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.userTotalScores')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={userStats?.userStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="userName" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalScore" fill={chartTheme.red} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.userAccuracy')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats?.userStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="userName" stroke={chartTheme.axis} />
                <YAxis stroke={chartTheme.axis} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
                <Bar dataKey="accuracy" fill={chartTheme.green} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.averageScorePerUser')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats?.userStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="userName" stroke={chartTheme.axis} />
                <YAxis stroke={chartTheme.axis} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="averageScore" fill={chartTheme.gold} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="raceName" stroke={chartTheme.axis} />
            <YAxis stroke={chartTheme.axis} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
            <Legend wrapperStyle={{ color: chartTheme.axisLight }} />
            <Line type="monotone" dataKey="accuracy" stroke={chartTheme.red} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.averageScoreProgression')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={seasonProgress?.raceProgress || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="raceName" stroke={chartTheme.axis} />
            <YAxis stroke={chartTheme.axis} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="averageScore" stroke={chartTheme.red} fill={chartTheme.red} fillOpacity={0.2} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="constructorName" stroke={chartTheme.axis} />
            <YAxis stroke={chartTheme.axis} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t('stats.successRate')]} />
            <Bar dataKey="successRate" fill={chartTheme.red} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.correctPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="constructorName" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="correctPredictions" fill={chartTheme.green} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('stats.totalPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="constructorName" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="totalPredictions" fill={chartTheme.gold} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    const seasonState = getSeasonState(allRaces);
    if (seasonState === 'pre-season') {
      return (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🏎️</div>
          <h3 className="text-lg font-semibold mb-2 text-white">{t('common.seasonNotStarted')}</h3>
          <p className="text-slate-400">{t('common.seasonNotStartedDescription')}</p>
        </div>
      );
    }
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{t('common.waitingForResults')}</h3>
        <p className="text-slate-400">{t('common.waitingForResultsDescription')}</p>
      </div>
    );
  };

  const renderContent = () => {
    if (overviewLoading) {
      return renderLoading(t('stats.loadingOverview'));
    }

    if (overview && overview.completedRaces === 0) {
      return renderEmptyState();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
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

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-f1-red"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-white mb-3 uppercase tracking-f1">{t('stats.teaserTitle')}</h1>
          <p className="text-slate-400 mb-6">{t('stats.teaserDescription')}</p>
          <div className="bg-f1-surface-elevated rounded-lg border border-f1-border p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-slate-300">{t('stats.teaserFeature1')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-slate-300">{t('stats.teaserFeature2')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-slate-300">{t('stats.teaserFeature3')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={login}
            className="btn btn-primary inline-flex items-center"
          >
            <FacebookIcon className="w-4 h-4 mr-2" />
            {t('predict.loginFacebook')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto py-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-f1">
            <span className="text-f1-red">F1</span> {t('stats.titleSuffix')}
          </h1>
          <p className="text-slate-400">{t('stats.subtitle')}</p>
        </div>

        {/* Tab Navigation — dropdown on mobile, tabs on desktop */}
        <div className="bg-f1-surface rounded-lg border border-f1-border mb-8 checkered-bg">
          {/* Mobile dropdown */}
          <div className="md:hidden p-3">
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                navigate(`/stats/${e.target.value}`);
              }}
              className="w-full bg-f1-surface-elevated border border-f1-border rounded-lg px-4 py-3 text-white text-sm font-medium appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
            >
              {tabs.map((tabItem) => (
                <option key={tabItem.id} value={tabItem.id}>
                  {tabItem.name}
                </option>
              ))}
            </select>
          </div>
          {/* Desktop tabs */}
          <div className="hidden md:block border-b border-f1-border">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    setActiveTab(tabItem.id);
                    navigate(`/stats/${tabItem.id}`);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap shrink-0 uppercase tracking-f1 transition-colors ${
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
