import type { Race, User, LeaderboardEntry, PredictionResult } from '../api/client';

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
  },
  {
    id: 6,
    name: 'George Fan',
    email: 'george@example.com',
    profilePictureUrl: null
  },
  {
    id: 7,
    name: 'Fernando Fan',
    email: 'fernando@example.com',
    profilePictureUrl: null
  },
  {
    id: 8,
    name: 'Oscar Fan',
    email: 'oscar@example.com',
    profilePictureUrl: null
  }
];

export const mockRaces: Race[] = [
  {
    id: '2025-1',
    season: 2025,
    round: 1,
    raceName: 'Bahrain Grand Prix',
    circuitName: 'Bahrain International Circuit',
    country: 'Bahrain',
    locality: 'Sakhir',
    date: '2025-03-02',
    time: '15:00:00',
    
    // Practice sessions
    practice1Date: '2025-02-28',
    practice1Time: '11:30:00',
    practice2Date: '2025-02-28',
    practice2Time: '15:00:00',
    practice3Date: '2025-03-01',
    practice3Time: '12:00:00',
    
    // Qualifying
    qualifyingDate: '2025-03-01',
    qualifyingTime: '15:00:00',
    
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'SAI',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-2',
    season: 2025,
    round: 2,
    raceName: 'Saudi Arabian Grand Prix',
    circuitName: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    locality: 'Jeddah',
    date: '2025-03-09',
    time: '17:00:00',
    
    // Practice sessions
    practice1Date: '2025-03-07',
    practice1Time: '13:30:00',
    practice2Date: '2025-03-07',
    practice2Time: '17:00:00',
    practice3Date: '2025-03-08',
    practice3Time: '13:00:00',
    
    // Qualifying
    qualifyingDate: '2025-03-08',
    qualifyingTime: '16:00:00',
    
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'LEC',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-3',
    season: 2025,
    round: 3,
    raceName: 'Australian Grand Prix',
    circuitName: 'Albert Park Grand Prix Circuit',
    country: 'Australia',
    locality: 'Melbourne',
    date: '2025-03-24',
    time: '04:00:00',
    
    // Practice sessions
    practice1Date: '2025-03-22',
    practice1Time: '00:30:00',
    practice2Date: '2025-03-22',
    practice2Time: '04:00:00',
    practice3Date: '2025-03-23',
    practice3Time: '01:00:00',
    
    // Qualifying
    qualifyingDate: '2025-03-23',
    qualifyingTime: '04:00:00',
    
    completed: true,
    firstPlaceDriverId: 'SAI',
    secondPlaceDriverId: 'LEC',
    thirdPlaceDriverId: 'NOR',
    fastestLapDriverId: 'SAI',
    driverOfTheDayId: 'SAI'
  },
  {
    id: '2025-4',
    season: 2025,
    round: 4,
    raceName: 'Japanese Grand Prix',
    circuitName: 'Suzuka Circuit',
    country: 'Japan',
    locality: 'Suzuka',
    date: '2025-04-07',
    time: '05:00:00',
    
    // Practice sessions
    practice1Date: '2025-04-05',
    practice1Time: '01:30:00',
    practice2Date: '2025-04-05',
    practice2Time: '05:00:00',
    practice3Date: '2025-04-06',
    practice3Time: '02:00:00',
    
    // Qualifying
    qualifyingDate: '2025-04-06',
    qualifyingTime: '05:00:00',
    
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'SAI',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-5',
    season: 2025,
    round: 5,
    raceName: 'Chinese Grand Prix',
    circuitName: 'Shanghai International Circuit',
    country: 'China',
    locality: 'Shanghai',
    date: '2025-04-21',
    time: '07:00:00',
    
    // Practice sessions
    practice1Date: '2025-04-19',
    practice1Time: '03:30:00',
    practice2Date: '2025-04-19',
    practice2Time: '07:00:00',
    practice3Date: '2025-04-20',
    practice3Time: '04:00:00',
    
    // Qualifying
    qualifyingDate: '2025-04-20',
    qualifyingTime: '07:00:00',
    
    completed: false,
    firstPlaceDriverId: null,
    secondPlaceDriverId: null,
    thirdPlaceDriverId: null,
    fastestLapDriverId: null,
    driverOfTheDayId: null
  },
  {
    id: '2025-6',
    season: 2025,
    round: 6,
    raceName: 'Miami Grand Prix',
    circuitName: 'Miami International Autodrome',
    country: 'United States',
    locality: 'Miami',
    date: '2025-05-05',
    time: '21:00:00',
    
    // Practice sessions
    practice1Date: '2025-05-03',
    practice1Time: '17:30:00',
    practice2Date: '2025-05-03',
    practice2Time: '21:00:00',
    practice3Date: '2025-05-04',
    practice3Time: '18:00:00',
    
    // Qualifying
    qualifyingDate: '2025-05-04',
    qualifyingTime: '21:00:00',
    
    completed: false,
    firstPlaceDriverId: null,
    secondPlaceDriverId: null,
    thirdPlaceDriverId: null,
    fastestLapDriverId: null,
    driverOfTheDayId: null
  },
  {
    id: '2025-7',
    season: 2025,
    round: 7,
    raceName: 'Emilia Romagna Grand Prix',
    circuitName: 'Imola Circuit',
    country: 'Italy',
    locality: 'Imola',
    date: '2025-05-19',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'LEC',
    secondPlaceDriverId: 'VER',
    thirdPlaceDriverId: 'SAI',
    fastestLapDriverId: 'LEC',
    driverOfTheDayId: 'LEC'
  },
  {
    id: '2025-8',
    season: 2025,
    round: 8,
    raceName: 'Monaco Grand Prix',
    circuitName: 'Circuit de Monaco',
    country: 'Monaco',
    locality: 'Monte Carlo',
    date: '2025-05-26',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'LEC',
    thirdPlaceDriverId: 'PER',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-9',
    season: 2025,
    round: 9,
    raceName: 'Spanish Grand Prix',
    circuitName: 'Circuit de Barcelona-Catalunya',
    country: 'Spain',
    locality: 'Barcelona',
    date: '2025-06-02',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'HAM',
    thirdPlaceDriverId: 'RUS',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'HAM'
  },
  {
    id: '2025-10',
    season: 2025,
    round: 10,
    raceName: 'Canadian Grand Prix',
    circuitName: 'Circuit Gilles Villeneuve',
    country: 'Canada',
    locality: 'Montreal',
    date: '2025-06-09',
    time: '19:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'NOR',
    thirdPlaceDriverId: 'LEC',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'NOR'
  },
  {
    id: '2025-11',
    season: 2025,
    round: 11,
    raceName: 'Austrian Grand Prix',
    circuitName: 'Red Bull Ring',
    country: 'Austria',
    locality: 'Spielberg',
    date: '2025-06-23',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'LEC',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-12',
    season: 2025,
    round: 12,
    raceName: 'British Grand Prix',
    circuitName: 'Silverstone Circuit',
    country: 'United Kingdom',
    locality: 'Silverstone',
    date: '2025-07-07',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'HAM',
    secondPlaceDriverId: 'VER',
    thirdPlaceDriverId: 'RUS',
    fastestLapDriverId: 'HAM',
    driverOfTheDayId: 'HAM'
  },
  {
    id: '2025-13',
    season: 2025,
    round: 13,
    raceName: 'Hungarian Grand Prix',
    circuitName: 'Hungaroring',
    country: 'Hungary',
    locality: 'Budapest',
    date: '2025-07-21',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'LEC',
    thirdPlaceDriverId: 'SAI',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'LEC'
  },
  {
    id: '2025-14',
    season: 2025,
    round: 14,
    raceName: 'Belgian Grand Prix',
    circuitName: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    locality: 'Spa',
    date: '2025-07-28',
    time: '14:00:00',
    completed: true,
    firstPlaceDriverId: 'VER',
    secondPlaceDriverId: 'PER',
    thirdPlaceDriverId: 'LEC',
    fastestLapDriverId: 'VER',
    driverOfTheDayId: 'VER'
  },
  {
    id: '2025-15',
    season: 2025,
    round: 15,
    raceName: 'Dutch Grand Prix',
    circuitName: 'Circuit Park Zandvoort',
    country: 'Netherlands',
    locality: 'Zandvoort',
    date: '2025-08-25',
    time: '14:00:00',
    completed: false,
    firstPlaceDriverId: null,
    secondPlaceDriverId: null,
    thirdPlaceDriverId: null,
    fastestLapDriverId: null,
    driverOfTheDayId: null
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
  },
  {
    userId: 6,
    userName: 'George Fan',
    profilePictureUrl: null,
    totalScore: 142
  },
  {
    userId: 7,
    userName: 'Fernando Fan',
    profilePictureUrl: null,
    totalScore: 128
  },
  {
    userId: 8,
    userName: 'Oscar Fan',
    profilePictureUrl: null,
    totalScore: 115
  }
];

// Race-specific results with position changes
export const mockRaceResults: Record<string, PredictionResult[]> = {
  '2025-1': [ // Bahrain GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'SAI',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 3,
      previousSeasonPosition: 3
    },
    {
      userId: 4,
      userName: 'Lando Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'NOR',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'NOR',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 4,
      previousSeasonPosition: 4
    },
    {
      userId: 5,
      userName: 'Carlos Fan',
      profilePictureUrl: null,
      score: 2,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 5,
      previousSeasonPosition: 5
    }
  ],
  '2025-2': [ // Saudi Arabian GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 3,
      previousSeasonPosition: 3
    },
    {
      userId: 4,
      userName: 'Lando Fan',
      profilePictureUrl: null,
      score: 3,
      prediction: {
        firstPlaceDriverId: 'NOR',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'NOR',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 4,
      previousSeasonPosition: 4
    },
    {
      userId: 5,
      userName: 'Carlos Fan',
      profilePictureUrl: null,
      score: 5,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 5,
      previousSeasonPosition: 5
    }
  ],
  '2025-3': [ // Australian GP - with position changes!
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 1,
      previousSeasonPosition: 3
    },
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 2,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 2,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'SAI',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 3,
      previousSeasonPosition: 2
    },
    {
      userId: 4,
      userName: 'Lando Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'NOR',
        secondPlaceDriverId: 'SAI',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'NOR',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 4,
      previousSeasonPosition: 4
    },
    {
      userId: 5,
      userName: 'Carlos Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 5,
      previousSeasonPosition: 5
    }
  ],
  '2025-4': [ // Japanese GP - more dramatic changes
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 6,
      userName: 'George Fan',
      profilePictureUrl: null,
      score: 9,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'RUS',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'RUS'
      },
      seasonPosition: 5,
      previousSeasonPosition: 6
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 3,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 5,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 3,
      previousSeasonPosition: 2
    },
    {
      userId: 7,
      userName: 'Fernando Fan',
      profilePictureUrl: null,
      score: 7,
      prediction: {
        firstPlaceDriverId: 'ALO',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'ALO',
        driverOfTheDayId: 'ALO'
      },
      seasonPosition: 6,
      previousSeasonPosition: 7
    }
  ],
  '2025-5': [ // Chinese GP - final dramatic race
    {
      userId: 8,
      userName: 'Oscar Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'PIA',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'PIA',
        driverOfTheDayId: 'PIA'
      },
      seasonPosition: 7,
      previousSeasonPosition: 8
    },
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'NOR',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 4,
      userName: 'Lando Fan',
      profilePictureUrl: null,
      score: 9,
      prediction: {
        firstPlaceDriverId: 'NOR',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PIA',
        fastestLapDriverId: 'NOR',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 3,
      previousSeasonPosition: 4
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 2,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 4,
      previousSeasonPosition: 3
    }
  ],
  '2025-6': [ // Miami GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'HAM',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 3,
      previousSeasonPosition: 3
    }
  ],
  '2025-7': [ // Emilia Romagna GP
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    },
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 5,
      userName: 'Carlos Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'VER',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 4,
      previousSeasonPosition: 5
    }
  ],
  '2025-8': [ // Monaco GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 3,
      previousSeasonPosition: 3
    }
  ],
  '2025-9': [ // Spanish GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'HAM',
        thirdPlaceDriverId: 'RUS',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 9,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'RUS',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    },
    {
      userId: 6,
      userName: 'George Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'RUS',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'HAM',
        fastestLapDriverId: 'RUS',
        driverOfTheDayId: 'RUS'
      },
      seasonPosition: 5,
      previousSeasonPosition: 6
    }
  ],
  '2025-10': [ // Canadian GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'NOR',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 4,
      userName: 'Lando Fan',
      profilePictureUrl: null,
      score: 9,
      prediction: {
        firstPlaceDriverId: 'NOR',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'NOR',
        driverOfTheDayId: 'NOR'
      },
      seasonPosition: 3,
      previousSeasonPosition: 4
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'NOR',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    }
  ],
  '2025-11': [ // Austrian GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 3,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    }
  ],
  '2025-12': [ // British GP
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'RUS',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    },
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'HAM',
        thirdPlaceDriverId: 'RUS',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 6,
      userName: 'George Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'RUS',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'HAM',
        fastestLapDriverId: 'RUS',
        driverOfTheDayId: 'RUS'
      },
      seasonPosition: 4,
      previousSeasonPosition: 5
    }
  ],
  '2025-13': [ // Hungarian GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'LEC',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 8,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'SAI',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 2
    },
    {
      userId: 5,
      userName: 'Carlos Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'SAI',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'SAI',
        driverOfTheDayId: 'SAI'
      },
      seasonPosition: 4,
      previousSeasonPosition: 4
    }
  ],
  '2025-14': [ // Belgian GP
    {
      userId: 1,
      userName: 'Max Fan',
      profilePictureUrl: null,
      score: 11,
      prediction: {
        firstPlaceDriverId: 'VER',
        secondPlaceDriverId: 'PER',
        thirdPlaceDriverId: 'LEC',
        fastestLapDriverId: 'VER',
        driverOfTheDayId: 'VER'
      },
      seasonPosition: 1,
      previousSeasonPosition: 1
    },
    {
      userId: 2,
      userName: 'Lewis Fan',
      profilePictureUrl: null,
      score: 4,
      prediction: {
        firstPlaceDriverId: 'HAM',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'HAM',
        driverOfTheDayId: 'HAM'
      },
      seasonPosition: 3,
      previousSeasonPosition: 2
    },
    {
      userId: 3,
      userName: 'Charles Fan',
      profilePictureUrl: null,
      score: 6,
      prediction: {
        firstPlaceDriverId: 'LEC',
        secondPlaceDriverId: 'VER',
        thirdPlaceDriverId: 'PER',
        fastestLapDriverId: 'LEC',
        driverOfTheDayId: 'LEC'
      },
      seasonPosition: 2,
      previousSeasonPosition: 3
    }
  ]
};

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