import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import RacesPage from './pages/RacesPage';
import RaceDetailPage from './pages/RaceDetailPage';
import PredictionPage from './pages/PredictionPage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Layout>
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
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="text-6xl mb-6">🏁</div>
                      <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-f1">{404}</h1>
                      <p className="text-slate-400 mb-8">This page could not be found.</p>
                      <a href="/" className="btn btn-primary">Back to Home</a>
                    </div>
                  } />
                </Routes>
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
