import { test, expect } from '@playwright/test';

test.describe('Page Tests', () => {
  test('should load ProfilePage', async ({ page }) => {
    await page.goto('/profile');

    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);

    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load StatsPage', async ({ page }) => {
    await page.goto('/stats');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load RaceDetailPage', async ({ page }) => {
    await page.goto('/races/2025-1');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load ResultsPage', async ({ page }) => {
    await page.goto('/races/2025-1/results');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load DataDeletionPage', async ({ page }) => {
    await page.goto('/data-deletion');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load PrivacyPolicyPage', async ({ page }) => {
    await page.goto('/privacy-policy');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should still have the app title
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Should show some content (either 404 or redirect)
    await expect(page.locator('main')).toBeVisible();
  });
});
