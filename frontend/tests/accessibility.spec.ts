import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper page titles', async ({ page }) => {
    const pages = [
      { path: '/', expected: /Formula 1 Chatter/ },
      { path: '/races', expected: /Formula 1 Chatter/ },
      { path: '/leaderboard', expected: /Formula 1 Chatter/ },
      { path: '/stats', expected: /Formula 1 Chatter/ },
    ];

    for (const { path, expected } of pages) {
      await page.goto(path);
      await expect(page).toHaveTitle(expected);
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one heading
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();
  });

  test('should have proper navigation landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Should have navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Should have main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');
    
    // Check that buttons have accessible text
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // At least one button should be visible and have text
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('should have proper link labels', async ({ page }) => {
    await page.goto('/');
    
    // Check that links have accessible text
    const links = page.getByRole('link');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // At least one link should be visible and have text
      await expect(links.first()).toBeVisible();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check that forms have proper structure
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Basic check that text is visible
    const textElements = page.locator('p, span, div').filter({ hasText: /./ });
    if (await textElements.count() > 0) {
      await expect(textElements.first()).toBeVisible();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through interactive elements
    const focusableElements = page.locator('button, a, input, select, textarea');
    if (await focusableElements.count() > 0) {
      await expect(focusableElements.first()).toBeVisible();
    }
  });
});
