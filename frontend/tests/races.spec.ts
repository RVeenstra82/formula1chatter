import { test, expect } from '@playwright/test';

test.describe('Races Page', () => {
  test('should load races page', async ({ page }) => {
    await page.goto('/races');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    
    // Check that we're on the races page
    await expect(page).toHaveURL(/.*\/races/);
  });

  test('should display races page content', async ({ page }) => {
    await page.goto('/races');
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
    
    // Should have a title or heading
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
  });

  test('should have navigation back to home', async ({ page }) => {
    await page.goto('/races');
    
    // Should have navbar with home link
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should be able to navigate back to home
    await navbar.getByRole('link').first().click();
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('should display race information when available', async ({ page }) => {
    await page.goto('/races');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content (either races or loading/empty state)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
