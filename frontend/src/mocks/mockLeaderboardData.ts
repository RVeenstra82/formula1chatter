import type { Race, Prediction, User, LeaderboardEntry, PredictionResult } from '../api/client';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Max Fan',
    email: 'max@example.com',
    profilePictureUrl: null
  },
  {
    id: 2,
    name: 'Lewis Fan',
    email: 'lewis@example.com',
    profilePictureUrl: null
  },
  {
    id: 3,
    name: 'Charles Fan',
    email: 'charles@example.com',
    profilePictureUrl: null
  },
  {
    id: 4,
    name: 'Lando Fan',
    email: 'lando@example.com',
    profilePictureUrl: null
  },
  {
    id: 5,
    name: 'Carlos Fan',
    email: 'carlos@example.com',
    profilePictureUrl: null
  }
];

export const mockRaces: Race[] = [
  {
    id: '1',
    season: 2024,
    round: 1,
    raceName: 'Bahrain Grand Prix',
    circuitName: 'Bahrain International Circuit',
    country: 'Bahrain',
    locality: 'Sakhir',
    date: '2024-03-02',
    time: '15:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'SAI',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2',
    season: 2024,
    round: 2,
    raceName: 'Saudi Arabian Grand Prix',
    circuitName: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    locality: 'Jeddah',
    date: '2024-03-09',
    time: '20:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'LEC',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '3',
    season: 2024,
    round: 3,
    raceName: 'Australian Grand Prix',
    circuitName: 'Albert Park Circuit',
    country: 'Australia',
    locality: 'Melbourne',
    date: '2024-03-24',
    time: '15:00:00',
    completed: true,
    firstPlaceDriverId: 'SAI',
    secondPlaceDriverId: 'LEC',
    thirdPlaceDriverId: 'NOR',
    fastestLapDriverId: 'SAI',
    driverOfTheDayId: 'SAI'
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: 1,
    userName: 'Max Fan',
    profilePictureUrl: null,
    totalScore: 245
  },
  {
    userId: 2,
    userName: 'Lewis Fan',
    profilePictureUrl: null,
    totalScore: 198
  },
  {
    userId: 3,
    userName: 'Charles Fan',
    profilePictureUrl: null,
    totalScore: 176
  },
  {
    userId: 4,
    userName: 'Lando Fan',
    profilePictureUrl: null,
    totalScore: 165
  },
  {
    userId: 5,
    userName: 'Carlos Fan',
    profilePictureUrl: null,
    totalScore: 154
  }
];

export const mockPredictionResults: PredictionResult[] = [
  {
    userId: 1,
    userName: 'Max Fan',
    profilePictureUrl: null,
    score: 25,
    prediction: {
      firstPlaceDriverId: 'VER',
      secondPlaceDriverId: 'PER',
      thirdPlaceDriverId: 'SAI',
      fastestLapDriverId: 'VER',
      driverOfTheDayId: 'VER'
    }
  },
  {
    userId: 2,
    userName: 'Lewis Fan',
    profilePictureUrl: null,
    score: 20,
    prediction: {
      firstPlaceDriverId: 'VER',
      secondPlaceDriverId: 'SAI',
      thirdPlaceDriverId: 'PER',
      fastestLapDriverId: 'VER',
      driverOfTheDayId: 'VER'
    }
  }
]; 