import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should show the application title', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title contains "F1 Chatter"
    await expect(page).toHaveTitle(/F1 Chatter/);
  });

  test('should display the navbar', async ({ page }) => {
    await page.goto('/');
    
    // Navbar should be visible
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should have navigation links
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /races/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /leaderboard/i })).toBeVisible();
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
    await expect(page.getByText('Bahrain, Sakhir')).toBeVisible();
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
    
    // Click the predict button
    await page.getByRole('button', { name: /predict/i }).click();
    
    // Should navigate to the prediction page
    await expect(page).toHaveURL(/.*\/races\/2023-1\/predict/);
  });
}); 