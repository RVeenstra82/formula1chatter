import axios from 'axios';

// For local development, use proxy. For production, use the Render backend URL
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'https://formula1chatter.onrender.com');

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Keep for OAuth2 callback
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Don't reload the page, just let the error propagate
      // The AuthContext will handle setting user to null
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  isAdmin?: boolean;
}

export interface Race {
  id: string;
  season: number;
  round: number;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time: string;
  firstPlaceDriverId: string | null;
  secondPlaceDriverId: string | null;
  thirdPlaceDriverId: string | null;
  fastestLapDriverId: string | null;
  driverOfTheDayId: string | null;
  completed: boolean;
}

export interface Driver {
  id: string;
  code: string;
  number: string | null;
  firstName: string;
  lastName: string;
  nationality: string;
  constructorId: string | null;
  constructorName: string | null;
  profilePictureUrl: string | null;
}

export interface Prediction {
  firstPlaceDriverId: string;
  secondPlaceDriverId: string;
  thirdPlaceDriverId: string;
  fastestLapDriverId: string;
  driverOfTheDayId: string;
}

export interface PredictionResult {
  userId: number;
  userName: string;
  profilePictureUrl: string | null;
  score: number;
  prediction: Prediction;
  seasonPosition?: number;
  previousSeasonPosition?: number;
}

export interface LeaderboardEntry {
  userId: number;
  userName: string;
  profilePictureUrl: string | null;
  totalScore: number;
}

// API Functions
export const api = {
  // Auth
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/user');
    return response.data;
  },

  getAuthStatus: async (): Promise<{ authenticated: boolean }> => {
    const response = await apiClient.get('/auth/status');
    return response.data;
  },

  // Races
  getCurrentSeasonRaces: async (): Promise<Race[]> => {
    const response = await apiClient.get('/races/current-season');
    return response.data;
  },

  getUpcomingRaces: async (): Promise<Race[]> => {
    const response = await apiClient.get('/races/upcoming');
    return response.data;
  },

  getNextRace: async (): Promise<Race> => {
    const response = await apiClient.get('/races/next');
    return response.data;
  },

  getRaceById: async (id: string): Promise<Race> => {
    const response = await apiClient.get(`/races/${id}`);
    return response.data;
  },

  // Drivers
  getAllDrivers: async (): Promise<Driver[]> => {
    const response = await apiClient.get('/drivers');
    return response.data;
  },

  getActiveDriversForRace: async (raceId: string): Promise<Driver[]> => {
    const response = await apiClient.get(`/drivers/active/${raceId}`);
    return response.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const response = await apiClient.get(`/drivers/${id}`);
    return response.data;
  },

  // Predictions
  savePrediction: async (userId: number, raceId: string, prediction: Prediction): Promise<void> => {
    await apiClient.post(`/predictions/${raceId}?userId=${userId}`, prediction);
  },

  getUserPredictionForRace: async (userId: number, raceId: string): Promise<Prediction | null> => {
    try {
      const response = await apiClient.get(`/predictions/user/${userId}/race/${raceId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getRaceResults: async (raceId: string): Promise<PredictionResult[]> => {
    const response = await apiClient.get(`/predictions/race/${raceId}/results`);
    return response.data;
  },

  getSeasonLeaderboard: async (season?: number): Promise<LeaderboardEntry[]> => {
    const url = season ? `/predictions/leaderboard?season=${season}` : '/predictions/leaderboard';
    const response = await apiClient.get(url);
    return response.data;
  },

  getUserSeasonScore: async (userId: number, season?: number): Promise<number> => {
    const url = season
      ? `/predictions/user/${userId}/score?season=${season}`
      : `/predictions/user/${userId}/score`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get('/predictions/leaderboard');
    return response.data;
  },

  getRaceLeaderboard: async (raceId: string): Promise<PredictionResult[]> => {
    const response = await apiClient.get(`/predictions/race/${raceId}/results`);
    return response.data;
  },

  // Stats
  getStatsOverview: async (): Promise<any> => {
    const response = await apiClient.get('/stats/overview');
    return response.data;
  },

  getDriverPerformanceStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/driver-performance');
    return response.data;
  },

  getPredictionAccuracyStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/prediction-accuracy');
    return response.data;
  },

  getCircuitDifficultyStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/circuit-difficulty');
    return response.data;
  },

  getUserComparisonStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/user-comparison');
    return response.data;
  },

  getSeasonProgressStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/season-progress');
    return response.data;
  },

  getConstructorPerformanceStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/constructor-performance');
    return response.data;
  },
}; 