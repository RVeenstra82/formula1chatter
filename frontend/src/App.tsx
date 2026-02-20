import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Suspense, lazy } from 'react';

// Eager-loaded (always needed)
import HomePage from './pages/HomePage';

// Lazy-loaded pages
const RacesPage = lazy(() => import('./pages/RacesPage'));
const RaceDetailPage = lazy(() => import('./pages/RaceDetailPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DataDeletion = lazy(() => import('./pages/DataDeletion'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DonatePage = lazy(() => import('./pages/DonatePage'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );
}

function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="text-6xl mb-6">🏁</div>
      <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-f1">{t('common.notFound')}</h1>
      <p className="text-slate-400 mb-8">{t('common.pageNotFound')}</p>
      <a href="/" className="btn btn-primary">{t('common.backToHome')}</a>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/races" element={<RacesPage />} />
                    <Route path="/races/:raceId" element={<RaceDetailPage />} />
                    <Route path="/races/:raceId/predict" element={<PredictionPage />} />
                    <Route path="/races/:raceId/results" element={<ResultsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/stats/:tab" element={<StatsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/data-deletion" element={<DataDeletion />} />
                    <Route path="/donate" element={<DonatePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
