import { test, expect } from '@playwright/test';

test.describe('Basic UI Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that the main content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check that navigation links are present (using nav selector to be more specific)
    await expect(page.locator('nav').getByRole('link', { name: 'Races' })).toBeVisible();
    await expect(page.locator('nav').getByRole('link', { name: 'Leaderboard' })).toBeVisible();
  });

  test('should navigate to races page', async ({ page }) => {
    await page.goto('/');
    
    // Click on races link in navigation (not the button on homepage)
    await page.locator('nav').getByRole('link', { name: 'Races' }).click();
    
    // Should be on races page
    await expect(page).toHaveURL(/.*\/races/);
  });

  test('should navigate to leaderboard page', async ({ page }) => {
    await page.goto('/');
    
    // Click on leaderboard link in navigation
    await page.locator('nav').getByRole('link', { name: 'Leaderboard' }).click();
    
    // Should be on leaderboard page
    await expect(page).toHaveURL(/.*\/leaderboard/);
  });
});
