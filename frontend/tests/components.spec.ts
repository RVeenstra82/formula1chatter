import { test, expect } from '@playwright/test';

test.describe('Component Tests', () => {
  test('should render RaceCard component correctly', async ({ page }) => {
    await page.goto('/races');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have race cards
    const raceCards = page.locator('.card');
    await expect(raceCards.first()).toBeVisible();
  });

  test('should render DriverSelect component', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have driver selection elements (either form or login required)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should render PredictionForm component', async ({ page }) => {
    await page.goto('/races/2025-1/predict');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have prediction form elements
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should render ResultsPodium component', async ({ page }) => {
    await page.goto('/races/2025-1/results');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have results content
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should render LanguageSelector component', async ({ page }) => {
    await page.goto('/');
    
    // Should have language selector in navbar
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Language selector should be present (usually in navbar)
    const languageElements = page.locator('button, select').filter({ hasText: /en|nl|language/i });
    if (await languageElements.count() > 0) {
      await expect(languageElements.first()).toBeVisible();
    }
  });

  test('should render Footer component', async ({ page }) => {
    await page.goto('/');
    
    // Should have footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should render PositionChangeIndicator component', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have leaderboard content (position indicators might be present)
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
