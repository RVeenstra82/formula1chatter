import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  test('should load leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the leaderboard page
    await expect(page).toHaveURL(/.*\/leaderboard/);
  });

  test('should display leaderboard content', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
    
    // Should have a title or heading
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
  });

  test('should handle authentication state', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content (either leaderboard data or login required)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should have navigation back to home', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should have navbar with home link
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should be able to navigate back to home
    await navbar.getByRole('link').first().click();
    await expect(page).toHaveURL(/.*\/$/);
  });
});
