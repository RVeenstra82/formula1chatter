import { test, expect } from '@playwright/test';

test.describe('Prediction Page', () => {
  test('should load prediction page for a race', async ({ page }) => {
    // Navigate to a specific race prediction page
    await page.goto('/races/2025-1/predict');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the prediction page
    await expect(page).toHaveURL(/.*\/predict/);
  });

  test('should display prediction page content', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
    
    // Should have a title or heading
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
  });

  test('should handle authentication requirement', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content (either prediction form or login required)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should have navigation back to races', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Should have navbar
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should be able to navigate to races page
    await navbar.getByRole('link', { name: 'Races' }).click();
    await expect(page).toHaveURL(/.*\/races/);
  });
});
