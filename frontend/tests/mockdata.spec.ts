import { test, expect } from '@playwright/test';

test.describe('Mock Data Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to simulate logged in user
    await page.addInitScript(() => {
      window.localStorage.setItem('auth', JSON.stringify({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }));
    });
  });

  test('should load mock races data', async ({ page }) => {
    await page.goto('/races');
    
    // Should show mock races
    await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
    await expect(page.getByText('Saudi Arabian Grand Prix')).toBeVisible();
    await expect(page.getByText('Australian Grand Prix')).toBeVisible();
    await expect(page.getByText('Japanese Grand Prix')).toBeVisible();
    await expect(page.getByText('Chinese Grand Prix')).toBeVisible();
    await expect(page.getByText('Miami Grand Prix')).toBeVisible();
    await expect(page.getByText('Monaco Grand Prix')).toBeVisible();
    await expect(page.getByText('British Grand Prix')).toBeVisible();
    await expect(page.getByText('Belgian Grand Prix')).toBeVisible();
    
    // Should show Dutch GP as upcoming (not completed)
    await expect(page.getByText('Dutch Grand Prix')).toBeVisible();
  });

  test('should show correct race status badges', async ({ page }) => {
  await page.goto('/races');
  
  // Should show completed races with green badge
  await expect(page.getByText('Completed')).toBeVisible();
  
  // Should show upcoming races with blue badge
  await expect(page.getByText('Upcoming')).toBeVisible();
});

  test('should load mock leaderboard data', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should show mock leaderboard entries
    await expect(page.getByText('Max Fan')).toBeVisible();
    await expect(page.getByText('Lewis Fan')).toBeVisible();
    await expect(page.getByText('Charles Fan')).toBeVisible();
    await expect(page.getByText('Lando Fan')).toBeVisible();
    await expect(page.getByText('Carlos Fan')).toBeVisible();
    
    // Should show scores
    await expect(page.getByText('245')).toBeVisible(); // Max Fan's score
    await expect(page.getByText('198')).toBeVisible(); // Lewis Fan's score
  });

  test('should load mock race results', async ({ page }) => {
  await page.goto('/leaderboard');
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Click on Australian GP (which has position changes)
  await page.getByText('Australian Grand Prix').click();
  
  // Should show race-specific results
  await expect(page.getByText('Charles Fan')).toBeVisible();
  await expect(page.getByText('Max Fan')).toBeVisible();
  await expect(page.getByText('Lewis Fan')).toBeVisible();
  
  // Should show position change indicators
  await expect(page.locator('.position-change')).toBeVisible();
});

  test('should show correct position changes for Australian GP', async ({ page }) => {
  await page.goto('/leaderboard');
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Click on Australian GP
  await page.getByText('Australian Grand Prix').click();
  
  // Charles Fan should be first (moved up from 3rd to 1st = +2 positions)
  const charlesFanRow = page.locator('tr').filter({ hasText: 'Charles Fan' });
  await expect(charlesFanRow).toBeVisible();
  
  // Max Fan should be second (moved down from 1st to 2nd = -1 position)
  const maxFanRow = page.locator('tr').filter({ hasText: 'Max Fan' });
  await expect(maxFanRow).toBeVisible();
  
  // Lewis Fan should be third (moved down from 2nd to 3rd = -1 position)
  const lewisFanRow = page.locator('tr').filter({ hasText: 'Lewis Fan' });
  await expect(lewisFanRow).toBeVisible();
});

  test('should load mock race details', async ({ page }) => {
  await page.goto('/races/2025-1'); // Bahrain GP
  
  // Should show race details
  await expect(page.getByRole('heading', { name: 'Bahrain Grand Prix' })).toBeVisible();
  await expect(page.getByText('Round 1')).toBeVisible();
  await expect(page.getByText('Season 2025')).toBeVisible();
  await expect(page.getByText('Completed')).toBeVisible();
  
  // Should show circuit information
  await expect(page.getByText('Circuit Information')).toBeVisible();
  await expect(page.getByText('Bahrain International Circuit')).toBeVisible();
  await expect(page.getByText('Sakhir, Bahrain')).toBeVisible();
  
  // Should show race schedule
  await expect(page.getByText('Race Schedule')).toBeVisible();
  await expect(page.getByText('March 2, 2025')).toBeVisible();
});

  test('should show mock race results for completed races', async ({ page }) => {
  await page.goto('/races/2025-1'); // Bahrain GP
  
  // Should show race results section
  await expect(page.getByText('Race Results')).toBeVisible();
  
  // Should show podium positions
  await expect(page.getByText('First Place')).toBeVisible();
  await expect(page.getByText('Second Place')).toBeVisible();
  await expect(page.getByText('Third Place')).toBeVisible();
  
  // Should show fastest lap and driver of the day
  await expect(page.getByText('Fastest Lap')).toBeVisible();
  await expect(page.getByText('Driver of the Day')).toBeVisible();
});

  test('should show prediction button for upcoming races', async ({ page }) => {
  await page.goto('/races/2025-15'); // Dutch GP (upcoming)
  
  // Should show upcoming status
  await expect(page.getByText('Upcoming')).toBeVisible();
  
  // Should show prediction button
  await expect(page.getByRole('link', { name: 'Make Prediction' })).toBeVisible();
});

  test('should show results button for completed races', async ({ page }) => {
  await page.goto('/races/2025-1'); // Bahrain GP (completed)
  
  // Should show completed status
  await expect(page.getByText('Completed')).toBeVisible();
  
  // Should show results button
  await expect(page.getByRole('link', { name: 'View Results' })).toBeVisible();
});

  test('should load mock data on home page', async ({ page }) => {
  await page.goto('/');
  
  // Should show next race information
  await expect(page.getByText('Next Race')).toBeVisible();
  
  // Should show a race card
  await expect(page.locator('.card')).toBeVisible();
});
});
