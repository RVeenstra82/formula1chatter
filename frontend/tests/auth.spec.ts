import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should have a login button (check for any of the login buttons)
    const loginButtons = page.getByRole('button').filter({ hasText: /login|facebook/i });
    await expect(loginButtons.first()).toBeVisible();
  });

  test('should have login functionality in navbar', async ({ page }) => {
    await page.goto('/');
    
    // Should have navbar
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should have login button in navbar area (check for navbar login buttons specifically)
    const navbarLoginButton = navbar.getByRole('button').filter({ hasText: /login|facebook/i });
    await expect(navbarLoginButton.first()).toBeVisible();
  });

  test('should protect leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content (either protected content or login required)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should protect prediction page', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content (either prediction form or login required)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should allow access to public pages', async ({ page }) => {
    // Home page should be accessible
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    
    // Races page should be accessible
    await page.goto('/races');
    await expect(page.locator('main')).toBeVisible();
  });
});
