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
  
  // Practice sessions
  practice1Date?: string;
  practice1Time?: string;
  practice2Date?: string;
  practice2Time?: string;
  practice3Date?: string;
  practice3Time?: string;
  
  // Qualifying
  qualifyingDate?: string;
  qualifyingTime?: string;
  
  // Sprint weekend information
  isSprintWeekend?: boolean;
  sprintDate?: string;
  sprintTime?: string;
  sprintQualifyingDate?: string;
  sprintQualifyingTime?: string;
  
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

export interface SprintRace {
  id: string;
  season: number;
  round: number;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time: string;
  
  // Sprint qualifying
  sprintQualifyingDate?: string;
  sprintQualifyingTime?: string;
  
  // Sprint race results
  firstPlaceDriverId: string | null;
  secondPlaceDriverId: string | null;
  thirdPlaceDriverId: string | null;
  completed: boolean;
}

export interface SprintPrediction {
  firstPlaceDriverId: string;
  secondPlaceDriverId: string;
  thirdPlaceDriverId: string;
}

// Stats types
export interface StatsOverview {
  totalUsers: number;
  completedRaces: number;
  totalPredictions: number;
  averageScore: number;
  mostPredictedDriver?: { driverCode: string; driverName: string };
}

export interface DriverPerformanceStats {
  driverStats: Array<{ driverCode: string; successRate: number; podiumFinishes: number; totalPredictions: number }>;
}

export interface ConstructorPerformanceStats {
  constructorStats: Array<{ constructorName: string; successRate: number; correctPredictions: number; totalPredictions: number }>;
}

export interface PredictionAccuracyStats {
  accuracyByType: Record<string, { accuracy: number; correctPredictions: number; totalPredictions: number }>;
}

export interface CircuitDifficultyStats {
  circuitStats: Array<{ circuitName: string; difficulty: number; accuracy: number; totalPredictions: number }>;
}

export interface UserComparisonStats {
  userStats: Array<{ userName: string; totalScore: number; accuracy: number; averageScore: number }>;
}

export interface SeasonProgressStats {
  raceProgress: Array<{ raceName: string; accuracy: number; averageScore: number }>;
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

  // Sprint Races
  getCurrentSeasonSprintRaces: async (): Promise<SprintRace[]> => {
    const response = await apiClient.get('/sprint-races/current-season');
    return response.data;
  },

  getUpcomingSprintRaces: async (): Promise<SprintRace[]> => {
    const response = await apiClient.get('/sprint-races/upcoming');
    return response.data;
  },

  getSprintRaceById: async (id: string): Promise<SprintRace> => {
    const response = await apiClient.get(`/sprint-races/${id}`);
    return response.data;
  },

  getSprintRaceBySeasonAndRound: async (season: number, round: number): Promise<SprintRace | null> => {
    try {
      const response = await apiClient.get(`/sprint-races/season/${season}/round/${round}`);
      return response.data;
    } catch {
      return null;
    }
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
  savePrediction: async (raceId: string, prediction: Prediction): Promise<void> => {
    await apiClient.post(`/predictions/${raceId}`, prediction);
  },

  // Sprint Predictions
  saveSprintPrediction: async (sprintRaceId: string, prediction: SprintPrediction): Promise<void> => {
    await apiClient.post(`/sprint-predictions/${sprintRaceId}`, prediction);
  },

  getUserSprintPredictionForRace: async (userId: number, sprintRaceId: string): Promise<SprintPrediction | null> => {
    try {
      const response = await apiClient.get(`/sprint-predictions/user/${userId}/sprint-race/${sprintRaceId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  getSprintRaceResults: async (sprintRaceId: string): Promise<PredictionResult[]> => {
    const response = await apiClient.get(`/sprint-predictions/sprint-race/${sprintRaceId}/results`);
    return response.data;
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
  getStatsOverview: async (): Promise<StatsOverview> => {
    const response = await apiClient.get('/stats/overview');
    return response.data;
  },

  getDriverPerformanceStats: async (): Promise<DriverPerformanceStats> => {
    const response = await apiClient.get('/stats/driver-performance');
    return response.data;
  },

  getPredictionAccuracyStats: async (): Promise<PredictionAccuracyStats> => {
    const response = await apiClient.get('/stats/prediction-accuracy');
    return response.data;
  },

  getCircuitDifficultyStats: async (): Promise<CircuitDifficultyStats> => {
    const response = await apiClient.get('/stats/circuit-difficulty');
    return response.data;
  },

  getUserComparisonStats: async (): Promise<UserComparisonStats> => {
    const response = await apiClient.get('/stats/user-comparison');
    return response.data;
  },

  getSeasonProgressStats: async (): Promise<SeasonProgressStats> => {
    const response = await apiClient.get('/stats/season-progress');
    return response.data;
  },

  getConstructorPerformanceStats: async (): Promise<ConstructorPerformanceStats> => {
    const response = await apiClient.get('/stats/constructor-performance');
    return response.data;
  },
};
