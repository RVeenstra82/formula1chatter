import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  mockStatsOverview,
  mockDriverStats,
  mockPredictionAccuracy,
  mockCircuitStats,
  mockUserStats,
  mockSeasonProgress,
  mockConstructorStats
} from '../services/mockStatsService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';



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
      // You could add a toast notification here
      console.log(t('stats.copiedToClipboard'));
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  
  // URL synchronization
  useEffect(() => {
    if (tab && tab !== activeTab) {
      // Validate tab parameter
      const validTabs = ['overview', 'drivers', 'constructors', 'accuracy', 'circuits', 'users', 'progress'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      } else {
        // Invalid tab, redirect to overview
        navigate('/stats/overview', { replace: true });
      }
    }
  }, [tab, navigate]);

  // Update URL when activeTab changes (but not on initial load)
  useEffect(() => {
    if (activeTab && activeTab !== 'overview' && !tab) {
      navigate(`/stats/${activeTab}`, { replace: true });
    }
  }, [activeTab, tab, navigate]);

  // If user is not logged in and tries to access users tab, redirect to overview
  React.useEffect(() => {
    if (!user && activeTab === 'users') {
      setActiveTab('overview');
      navigate('/stats/overview', { replace: true });
    }
  }, [user, activeTab, navigate]);

  // In development, use mock data directly
  const overview = import.meta.env.DEV ? mockStatsOverview : undefined;
  const driverStats = import.meta.env.DEV ? mockDriverStats : undefined;
  const predictionAccuracy = import.meta.env.DEV ? mockPredictionAccuracy : undefined;
  const circuitStats = import.meta.env.DEV ? mockCircuitStats : undefined;
  const userStats = import.meta.env.DEV ? (user ? mockUserStats : undefined) : undefined;
  const seasonProgress = import.meta.env.DEV ? mockSeasonProgress : undefined;
  const constructorStats = import.meta.env.DEV ? mockConstructorStats : undefined;

  const isLoading = false; // In development, no loading states needed

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: t('stats.overview') },
    { id: 'drivers', name: t('stats.driverPerformance') },
    { id: 'constructors', name: t('stats.constructorPerformance') },
    { id: 'accuracy', name: t('stats.predictionAccuracy') },
    { id: 'circuits', name: t('stats.circuitDifficulty') },
    ...(user ? [{ id: 'users', name: t('stats.userComparison') }] : []),
    { id: 'progress', name: t('stats.seasonProgress') },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('stats.totalUsers')}</p>
              
              <p className="text-2xl font-bold text-gray-900">{overview?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🏁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('stats.completedRaces')}</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.completedRaces || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('stats.totalPredictions')}</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totalPredictions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('stats.averageScore')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.averageScore ? overview.averageScore.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {overview?.mostPredictedDriver && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.mostPredictedDriver')}</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">{overview.mostPredictedDriver.driverCode}</span>
            </div>
            <div>
              <p className="text-xl font-semibold">{overview.mostPredictedDriver.driverName}</p>
              <p className="text-gray-600">{t('stats.driverCode')}: {overview.mostPredictedDriver.driverCode}</p>
            </div>
          </div>
        </div>
      )}

      {(!overview || overview.totalPredictions === 0) && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">{t('stats.noDataAvailable')}</h3>
          <p className="text-gray-600">{t('stats.startPredicting')}</p>
        </div>
      )}
    </div>
  );

  const renderDriverPerformance = () => (
    <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.driverSuccessRates')}</h3>
                  <ResponsiveContainer width="100%" height={400}>
            <BarChart data={driverStats?.driverStats?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="driverCode" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, t('stats.successRate')]} />
              <Bar dataKey="successRate" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.podiumFinishes')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="driverCode" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="podiumFinishes" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.totalPredictionsPerDriver')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStats?.driverStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="driverCode" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPredictions" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPredictionAccuracy = () => {
    const accuracyData = predictionAccuracy?.accuracyByType ? 
      Object.entries(predictionAccuracy.accuracyByType).map(([type, data]) => ({
        type: t(`stats.${type}`),
        accuracy: (data as any).accuracy,
        correct: (data as any).correctPredictions,
        total: (data as any).totalPredictions
      })) : [];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.predictionAccuracyByType')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
                          <Tooltip formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
            <Bar dataKey="accuracy" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.accuracyRadarChart')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={accuracyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="type" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name={t('stats.accuracy')} dataKey="accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCircuitDifficulty = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">{t('stats.circuitDifficultyLowerAccuracy')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={circuitStats?.circuitStats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, t('stats.difficulty')]} />
            <Bar dataKey="difficulty" fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.circuitAccuracy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.predictionsPerCircuit')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={circuitStats?.circuitStats?.slice(0, 8) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="circuitName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPredictions" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

    const renderUserComparison = () => {
    if (!user) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Inloggen Vereist</h3>
          <p className="text-gray-600">Je moet ingelogd zijn om gebruiker vergelijkingen te bekijken.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.userTotalScores')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={userStats?.userStats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="userName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalScore" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.userAccuracy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStats?.userStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
              <Bar dataKey="accuracy" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.averageScorePerUser')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStats?.userStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageScore" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  };

  const renderSeasonProgress = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">{t('stats.seasonProgressAccuracy')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={seasonProgress?.raceProgress || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="raceName" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, t('stats.accuracy')]} />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">{t('stats.averageScoreProgression')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={seasonProgress?.raceProgress || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="raceName" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="averageScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderConstructorPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">{t('stats.constructorSuccessRates')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={constructorStats?.constructorStats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="constructorName" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, t('stats.successRate')]} />
            <Bar dataKey="successRate" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.correctPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="constructorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="correctPredictions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('stats.totalPredictionsByConstructor')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={constructorStats?.constructorStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="constructorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPredictions" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('stats.loadingOverview')}</p>
            </div>
          </div>
        ) : renderOverview();
      case 'drivers':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('stats.loadingDriverStatistics')}</p>
            </div>
          </div>
        ) : renderDriverPerformance();
      case 'accuracy':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading accuracy data...</p>
            </div>
          </div>
        ) : renderPredictionAccuracy();
      case 'circuits':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading circuit data...</p>
            </div>
          </div>
        ) : renderCircuitDifficulty();
      case 'users':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading user data...</p>
            </div>
          </div>
        ) : renderUserComparison();
      case 'progress':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading season progress...</p>
            </div>
          </div>
        ) : renderSeasonProgress();
      case 'constructors':
        return false ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading constructor data...</p>
            </div>
          </div>
        ) : renderConstructorPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span className="text-f1-red">F1</span> Chatter Statistieken
            </h1>
            <p className="text-gray-600">{t('stats.subtitle')}</p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-f1-red text-white rounded-lg hover:bg-red-700 transition-colors"
            title={t('stats.shareThisStat')}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            {t('stats.shareThisStat')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/stats/${tab.id}`);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
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
