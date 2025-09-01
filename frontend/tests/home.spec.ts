import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should show the application title', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title contains "Formula 1 Chatter"
    await expect(page).toHaveTitle(/Formula 1 Chatter/);
  });

  test('should display the navbar with correct links', async ({ page }) => {
    await page.goto('/');
    
    // Navbar should be visible
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should have navigation links in the navbar
    await expect(navbar.getByRole('link', { name: 'Races' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
  });

  test('should display main content sections', async ({ page }) => {
    await page.goto('/');
    
    // Should have main content
    await expect(page.locator('main')).toBeVisible();
    
    // Should have a header or title section
    const titleSection = page.locator('h1, h2').first();
    await expect(titleSection).toBeVisible();
  });

  test('should have login functionality', async ({ page }) => {
    await page.goto('/');
    
    // Should have a login button (check for any of the login buttons)
    const loginButtons = page.getByRole('button').filter({ hasText: /login|facebook/i });
    await expect(loginButtons.first()).toBeVisible();
  });

  test('should navigate to races page from navbar', async ({ page }) => {
    await page.goto('/');
    
    // Click on races link in navigation
    await page.locator('nav').getByRole('link', { name: 'Races' }).click();
    
    // Should navigate to races page
    await expect(page).toHaveURL(/.*\/races/);
  });

  test('should navigate to leaderboard page from navbar', async ({ page }) => {
    await page.goto('/');
    
    // Click on leaderboard link in navigation
    await page.locator('nav').getByRole('link', { name: 'Leaderboard' }).click();
    
    // Should navigate to leaderboard page
    await expect(page).toHaveURL(/.*\/leaderboard/);
  });
});
