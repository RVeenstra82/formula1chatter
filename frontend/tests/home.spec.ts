import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should show the application title', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page title contains "Formula 1 Chatter"
  await expect(page).toHaveTitle(/Formula 1 Chatter/);
});

  test('should display the navbar', async ({ page }) => {
  await page.goto('/');
  
  // Navbar should be visible
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();
  
  // Should have navigation links
  await expect(page.locator('nav').getByRole('link', { name: 'Races' })).toBeVisible();
  await expect(page.locator('nav').getByRole('link', { name: 'Leaderboard' })).toBeVisible();
});

  test('should display next race information', async ({ page }) => {
  // Mock the API response for getting the next race
  await page.route('**/api/races/next', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '2023-1',
        season: 2023,
        round: 1,
        raceName: 'Bahrain Grand Prix',
        circuitName: 'Bahrain International Circuit',
        country: 'Bahrain',
        locality: 'Sakhir',
        date: '2023-03-05',
        time: '15:00:00',
        completed: false
      })
    });
  });

  await page.goto('/');
  
  // Should display the next race information
  await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
  await expect(page.getByText('Bahrain International Circuit')).toBeVisible();
  await expect(page.getByText('Sakhir, Bahrain')).toBeVisible();
});

  test('should navigate to prediction page when clicking on predict button', async ({ page }) => {
  // Mock the API response for getting the next race
  await page.route('**/api/races/next', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '2023-1',
        season: 2023,
        round: 1,
        raceName: 'Bahrain Grand Prix',
        circuitName: 'Bahrain International Circuit',
        country: 'Bahrain',
        locality: 'Sakhir',
        date: '2023-03-05',
        time: '15:00:00',
        completed: false
      })
    });
  });

  await page.goto('/');
  
  // Click the predict button (Make Prediction)
  await page.getByRole('link', { name: /make prediction/i }).click();
  
  // Should navigate to the prediction page
  await expect(page).toHaveURL(/.*\/bahrain\/predict/);
});
}); 