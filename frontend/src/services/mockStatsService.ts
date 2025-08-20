// Mock data service for local development
// This will only be used in development environment

export const mockStatsOverview = {
  totalUsers: 15,
  totalRaces: 24,
  completedRaces: 8,
  totalPredictions: 120,
  totalDrivers: 25,
  averageScore: 7.2,
  mostPredictedDriver: {
    driverId: "max_verstappen",
    driverName: "Max Verstappen",
    driverCode: "VER"
  }
};

export const mockDriverStats = {
  driverStats: [
    {
      driverId: "max_verstappen",
      driverName: "Max Verstappen",
      driverCode: "VER",
      constructor: "Red Bull Racing",
      correctPredictions: 45,
      totalPredictions: 60,
      successRate: 75.0,
      podiumFinishes: 6
    },
    {
      driverId: "lewis_hamilton",
      driverName: "Lewis Hamilton",
      driverCode: "HAM",
      constructor: "Mercedes",
      correctPredictions: 38,
      totalPredictions: 55,
      successRate: 69.1,
      podiumFinishes: 5
    },
    {
      driverId: "charles_leclerc",
      driverName: "Charles Leclerc",
      driverCode: "LEC",
      constructor: "Ferrari",
      correctPredictions: 32,
      totalPredictions: 48,
      successRate: 66.7,
      podiumFinishes: 4
    },
    {
      driverId: "lando_norris",
      driverName: "Lando Norris",
      driverCode: "NOR",
      constructor: "McLaren",
      correctPredictions: 28,
      totalPredictions: 45,
      successRate: 62.2,
      podiumFinishes: 3
    },
    {
      driverId: "carlos_sainz",
      driverName: "Carlos Sainz",
      driverCode: "SAI",
      constructor: "Ferrari",
      correctPredictions: 25,
      totalPredictions: 42,
      successRate: 59.5,
      podiumFinishes: 2
    },
    {
      driverId: "george_russell",
      driverName: "George Russell",
      driverCode: "RUS",
      constructor: "Mercedes",
      correctPredictions: 22,
      totalPredictions: 40,
      successRate: 55.0,
      podiumFinishes: 2
    },
    {
      driverId: "fernando_alonso",
      driverName: "Fernando Alonso",
      driverCode: "ALO",
      constructor: "Aston Martin",
      correctPredictions: 20,
      totalPredictions: 38,
      successRate: 52.6,
      podiumFinishes: 1
    },
    {
      driverId: "oscar_piastri",
      driverName: "Oscar Piastri",
      driverCode: "PIA",
      constructor: "McLaren",
      correctPredictions: 18,
      totalPredictions: 35,
      successRate: 51.4,
      podiumFinishes: 1
    }
  ],
  totalRaces: 8,
  totalDrivers: 25
};

export const mockPredictionAccuracy = {
  accuracyByType: {
    firstPlace: {
      totalPredictions: 120,
      correctPredictions: 72,
      accuracy: 60.0
    },
    secondPlace: {
      totalPredictions: 120,
      correctPredictions: 58,
      accuracy: 48.3
    },
    thirdPlace: {
      totalPredictions: 120,
      correctPredictions: 45,
      accuracy: 37.5
    },
    fastestLap: {
      totalPredictions: 120,
      correctPredictions: 38,
      accuracy: 31.7
    },
    driverOfTheDay: {
      totalPredictions: 120,
      correctPredictions: 42,
      accuracy: 35.0
    }
  },
  totalRaces: 8
};

export const mockCircuitStats = {
  circuitStats: [
    {
      circuitName: "Monaco",
      totalPredictions: 15,
      correctPredictions: 6,
      accuracy: 40.0,
      difficulty: 60.0,
      raceCount: 1,
      country: "Monaco"
    },
    {
      circuitName: "Singapore",
      totalPredictions: 15,
      correctPredictions: 7,
      accuracy: 46.7,
      difficulty: 53.3,
      raceCount: 1,
      country: "Singapore"
    },
    {
      circuitName: "Hongarije",
      totalPredictions: 15,
      correctPredictions: 8,
      accuracy: 53.3,
      difficulty: 46.7,
      raceCount: 1,
      country: "Hungary"
    },
    {
      circuitName: "Groot-Brittannië",
      totalPredictions: 15,
      correctPredictions: 9,
      accuracy: 60.0,
      difficulty: 40.0,
      raceCount: 1,
      country: "United Kingdom"
    },
    {
      circuitName: "Spanje",
      totalPredictions: 15,
      correctPredictions: 10,
      accuracy: 66.7,
      difficulty: 33.3,
      raceCount: 1,
      country: "Spain"
    },
    {
      circuitName: "Australië",
      totalPredictions: 15,
      correctPredictions: 11,
      accuracy: 73.3,
      difficulty: 26.7,
      raceCount: 1,
      country: "Australia"
    },
    {
      circuitName: "Bahrein",
      totalPredictions: 15,
      correctPredictions: 12,
      accuracy: 80.0,
      difficulty: 20.0,
      raceCount: 1,
      country: "Bahrain"
    },
    {
      circuitName: "Saudi-Arabië",
      totalPredictions: 15,
      correctPredictions: 13,
      accuracy: 86.7,
      difficulty: 13.3,
      raceCount: 1,
      country: "Saudi Arabia"
    }
  ],
  totalCircuits: 8
};

export const mockUserStats = {
  userStats: [
    {
      userId: 1,
      userName: "Jan Jansen",
      profilePictureUrl: null,
      totalPredictions: 8,
      correctPredictions: 5,
      accuracy: 62.5,
      totalScore: 42,
      averageScore: 5.25
    },
    {
      userId: 2,
      userName: "Piet Peters",
      profilePictureUrl: null,
      totalPredictions: 8,
      correctPredictions: 4,
      accuracy: 50.0,
      totalScore: 38,
      averageScore: 4.75
    },
    {
      userId: 3,
      userName: "Klaas Klaassen",
      profilePictureUrl: null,
      totalPredictions: 8,
      correctPredictions: 6,
      accuracy: 75.0,
      totalScore: 45,
      averageScore: 5.63
    },
    {
      userId: 4,
      userName: "Henk Hendriks",
      profilePictureUrl: null,
      totalPredictions: 8,
      correctPredictions: 3,
      accuracy: 37.5,
      totalScore: 28,
      averageScore: 3.5
    },
    {
      userId: 5,
      userName: "Willem Willems",
      profilePictureUrl: null,
      totalPredictions: 8,
      correctPredictions: 7,
      accuracy: 87.5,
      totalScore: 52,
      averageScore: 6.5
    }
  ],
  totalUsers: 5
};

export const mockSeasonProgress = {
  raceProgress: [
    {
      raceId: "2024-1",
      raceName: "Bahrain Grand Prix",
      round: 1,
      circuitName: "Bahrain International Circuit",
      totalPredictions: 15,
      correctPredictions: 12,
      accuracy: 80.0,
      averageScore: 6.8,
      date: "2024-03-02"
    },
    {
      raceId: "2024-2",
      raceName: "Saudi Arabian Grand Prix",
      round: 2,
      circuitName: "Jeddah Corniche Circuit",
      totalPredictions: 15,
      correctPredictions: 13,
      accuracy: 86.7,
      averageScore: 7.2,
      date: "2024-03-09"
    },
    {
      raceId: "2024-3",
      raceName: "Australian Grand Prix",
      round: 3,
      circuitName: "Albert Park Circuit",
      totalPredictions: 15,
      correctPredictions: 11,
      accuracy: 73.3,
      averageScore: 6.5,
      date: "2024-03-24"
    },
    {
      raceId: "2024-4",
      raceName: "Spanish Grand Prix",
      round: 4,
      circuitName: "Circuit de Barcelona-Catalunya",
      totalPredictions: 15,
      correctPredictions: 10,
      accuracy: 66.7,
      averageScore: 6.0,
      date: "2024-04-21"
    },
    {
      raceId: "2024-5",
      raceName: "British Grand Prix",
      round: 5,
      circuitName: "Silverstone Circuit",
      totalPredictions: 15,
      correctPredictions: 9,
      accuracy: 60.0,
      averageScore: 5.8,
      date: "2024-05-05"
    },
    {
      raceId: "2024-6",
      raceName: "Hungarian Grand Prix",
      round: 6,
      circuitName: "Hungaroring",
      totalPredictions: 15,
      correctPredictions: 8,
      accuracy: 53.3,
      averageScore: 5.2,
      date: "2024-05-19"
    },
    {
      raceId: "2024-7",
      raceName: "Singapore Grand Prix",
      round: 7,
      circuitName: "Marina Bay Street Circuit",
      totalPredictions: 15,
      correctPredictions: 7,
      accuracy: 46.7,
      averageScore: 4.8,
      date: "2024-06-02"
    },
    {
      raceId: "2024-8",
      raceName: "Monaco Grand Prix",
      round: 8,
      circuitName: "Circuit de Monaco",
      totalPredictions: 15,
      correctPredictions: 6,
      accuracy: 40.0,
      averageScore: 4.2,
      date: "2024-06-16"
    }
  ],
  totalRaces: 8
};

export const mockConstructorStats = {
  constructorStats: [
    {
      constructorId: "red_bull_racing",
      constructorName: "Red Bull Racing",
      correctPredictions: 85,
      totalPredictions: 120,
      successRate: 70.8,
      driverCount: 2
    },
    {
      constructorId: "mercedes",
      constructorName: "Mercedes",
      correctPredictions: 72,
      totalPredictions: 120,
      successRate: 60.0,
      driverCount: 2
    },
    {
      constructorId: "ferrari",
      constructorName: "Ferrari",
      correctPredictions: 68,
      totalPredictions: 120,
      successRate: 56.7,
      driverCount: 2
    },
    {
      constructorId: "mclaren",
      constructorName: "McLaren",
      correctPredictions: 58,
      totalPredictions: 120,
      successRate: 48.3,
      driverCount: 2
    },
    {
      constructorId: "aston_martin",
      constructorName: "Aston Martin",
      correctPredictions: 45,
      totalPredictions: 120,
      successRate: 37.5,
      driverCount: 2
    },
    {
      constructorId: "alpine",
      constructorName: "Alpine",
      correctPredictions: 38,
      totalPredictions: 120,
      successRate: 31.7,
      driverCount: 2
    }
  ],
  totalConstructors: 6
};
