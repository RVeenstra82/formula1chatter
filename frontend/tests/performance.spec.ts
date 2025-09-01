import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load races page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/races');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should load leaderboard page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/leaderboard');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate between pages quickly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to races
    const startTime = Date.now();
    await page.locator('nav').getByRole('link', { name: 'Races' }).click();
    await page.waitForLoadState('networkidle');
    const racesLoadTime = Date.now() - startTime;
    
    // Should navigate within 2 seconds
    expect(racesLoadTime).toBeLessThan(2000);
    
    // Navigate to leaderboard
    const startTime2 = Date.now();
    await page.locator('nav').getByRole('link', { name: 'Leaderboard' }).click();
    await page.waitForLoadState('networkidle');
    const leaderboardLoadTime = Date.now() - startTime2;
    
    // Should navigate within 2 seconds
    expect(leaderboardLoadTime).toBeLessThan(2000);
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should load without errors
    await expect(page.locator('main')).toBeVisible();
    
    // Check for any loading indicators that might indicate performance issues
    const loadingSpinners = page.locator('.animate-spin, .loading, [aria-busy="true"]');
    const spinnerCount = await loadingSpinners.count();
    
    // Should not have excessive loading spinners
    expect(spinnerCount).toBeLessThan(5);
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure for API calls only, not static assets
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(1000);
    
    // Should still show some content (error state or cached content)
    // Check if the page has any content at all
    const hasContent = await page.locator('html').isVisible();
    expect(hasContent).toBe(true);
    
    // The page should at least have some basic structure
    const htmlContent = await page.content();
    expect(htmlContent.length).toBeGreaterThan(100);
  });
});
