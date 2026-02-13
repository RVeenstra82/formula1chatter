import { test, expect } from '@playwright/test';

// Helper to build a future date string (YYYY-MM-DD)
function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Helper to build a past date string (YYYY-MM-DD)
function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  isAdmin: false,
};

function buildRace(overrides: Record<string, unknown>) {
  return {
    id: '1',
    season: 2026,
    round: 1,
    raceName: 'Test Grand Prix',
    circuitName: 'Test Circuit',
    country: 'Testland',
    locality: 'Testville',
    date: futureDate(30),
    time: '14:00:00',
    practice1Date: futureDate(28),
    practice1Time: '10:00:00',
    completed: false,
    ...overrides,
  };
}

const emptyLeaderboard: unknown[] = [];
const emptyStatsOverview = {
  totalUsers: 5,
  completedRaces: 0,
  totalPredictions: 0,
  averageScore: 0,
  mostPredictedDriver: null,
};

test.describe('Empty state messages', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth — inject a fake JWT token so the user is "logged in"
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        isAdmin: false,
      }));
      // Force English for consistent assertions
      localStorage.setItem('language', 'en');
    });
  });

  test.describe('Pre-season state', () => {
    test('leaderboard shows season not started', async ({ page }) => {
      const futureRaces = [
        buildRace({ id: '1', round: 1, date: futureDate(30), practice1Date: futureDate(28) }),
        buildRace({ id: '2', round: 2, date: futureDate(60), practice1Date: futureDate(58) }),
      ];

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: futureRaces })
      );
      await page.route('**/api/predictions/leaderboard', route =>
        route.fulfill({ json: emptyLeaderboard })
      );
      await page.route('**/api/auth/user', route =>
        route.fulfill({ json: mockUser })
      );

      await page.goto('/leaderboard');
      await expect(page.getByText('The Season Has Not Started Yet')).toBeVisible();
      await expect(page.getByText('The first race weekend has not started yet')).toBeVisible();
    });

    test('stats shows season not started', async ({ page }) => {
      const futureRaces = [
        buildRace({ id: '1', round: 1, date: futureDate(30), practice1Date: futureDate(28) }),
      ];

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: futureRaces })
      );
      await page.route('**/api/stats/overview', route =>
        route.fulfill({ json: emptyStatsOverview })
      );

      await page.goto('/stats/overview');
      await expect(page.getByText('The Season Has Not Started Yet')).toBeVisible();
      await expect(page.getByText('The first race weekend has not started yet')).toBeVisible();
    });
  });

  test.describe('Waiting for results state', () => {
    test('leaderboard shows waiting for results when race weekend started', async ({ page }) => {
      const racesWithPastPractice = [
        buildRace({ id: '1', round: 1, date: pastDate(1), practice1Date: pastDate(3), completed: false }),
        buildRace({ id: '2', round: 2, date: futureDate(14), practice1Date: futureDate(12) }),
      ];

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: racesWithPastPractice })
      );
      await page.route('**/api/predictions/leaderboard', route =>
        route.fulfill({ json: emptyLeaderboard })
      );
      await page.route('**/api/auth/user', route =>
        route.fulfill({ json: mockUser })
      );

      await page.goto('/leaderboard');
      await expect(page.getByText('Waiting for Race Results')).toBeVisible();
      await expect(page.getByText('Scores will be updated after the race results have been processed')).toBeVisible();
    });

    test('stats shows waiting for results when race weekend started', async ({ page }) => {
      const racesWithPastPractice = [
        buildRace({ id: '1', round: 1, date: pastDate(1), practice1Date: pastDate(3), completed: false }),
      ];

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: racesWithPastPractice })
      );
      await page.route('**/api/stats/overview', route =>
        route.fulfill({ json: emptyStatsOverview })
      );

      await page.goto('/stats/overview');
      await expect(page.getByText('Waiting for Race Results')).toBeVisible();
      await expect(page.getByText('Scores will be updated after the race results have been processed')).toBeVisible();
    });
  });

  test.describe('Data available state', () => {
    test('leaderboard shows data when races are completed', async ({ page }) => {
      const completedRaces = [
        buildRace({ id: '1', round: 1, date: pastDate(7), practice1Date: pastDate(9), completed: true }),
      ];
      const leaderboardData = [
        { userId: '1', userName: 'Test User', totalScore: 10 },
        { userId: '2', userName: 'Other User', totalScore: 8 },
      ];

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: completedRaces })
      );
      await page.route('**/api/predictions/leaderboard', route =>
        route.fulfill({ json: leaderboardData })
      );
      await page.route('**/api/auth/user', route =>
        route.fulfill({ json: mockUser })
      );

      await page.goto('/leaderboard');
      // Should NOT show empty state messages
      await expect(page.getByText('The Season Has Not Started Yet')).not.toBeVisible();
      await expect(page.getByText('Waiting for Race Results')).not.toBeVisible();
      // Should show leaderboard content (scope to main to avoid navbar match)
      await expect(page.locator('main').getByText('Test User')).toBeVisible();
    });

    test('stats shows data when races are completed', async ({ page }) => {
      const completedRaces = [
        buildRace({ id: '1', round: 1, date: pastDate(7), practice1Date: pastDate(9), completed: true }),
      ];
      const overviewWithData = {
        totalUsers: 5,
        completedRaces: 1,
        totalPredictions: 10,
        averageScore: 3.5,
        mostPredictedDriver: { driverName: 'Max Verstappen', driverCode: 'VER' },
      };

      await page.route('**/api/races/current-season', route =>
        route.fulfill({ json: completedRaces })
      );
      await page.route('**/api/stats/overview', route =>
        route.fulfill({ json: overviewWithData })
      );

      await page.goto('/stats/overview');
      // Should NOT show empty state messages
      await expect(page.getByText('The Season Has Not Started Yet')).not.toBeVisible();
      await expect(page.getByText('Waiting for Race Results')).not.toBeVisible();
    });
  });
});
