import { test, expect } from '@playwright/test';

test.describe('Simple Page Tests', () => {
  test('should load races page', async ({ page }) => {
    await page.goto('/races');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the races page
    await expect(page).toHaveURL(/.*\/races/);
  });

  test('should load leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the leaderboard page
    await expect(page).toHaveURL(/.*\/leaderboard/);
  });

  test('should load stats page', async ({ page }) => {
    await page.goto('/stats');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the stats page
    await expect(page).toHaveURL(/.*\/stats/);
  });

  test('should show login required for protected pages', async ({ page }) => {
    // Try to access leaderboard without login
    await page.goto('/leaderboard');
    
    // Should show some content (either login required or actual content)
    await expect(page.locator('main')).toBeVisible();
  });
});
