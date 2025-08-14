import { test, expect } from '@playwright/test';

test.describe('Privacy and Authentication', () => {
  test('should protect leaderboard from unauthorized access', async ({ page }) => {
  // Ensure no auth is set
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  await page.goto('/leaderboard');
  
  // Should redirect to login page or show login required
  await expect(page.getByText('Login Required')).toBeVisible();
  await expect(page.getByText('You need to be logged in to view the leaderboard.')).toBeVisible();
  
  // Should not show any user data
  await expect(page.locator('table')).not.toBeVisible();
  await expect(page.locator('.podium')).not.toBeVisible();
});

  test('should protect prediction page from unauthorized access', async ({ page }) => {
  // Ensure no auth is set
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  await page.goto('/races/2025-1/predict');
  
  // Should show login required message
  await expect(page.getByText('Login Required')).toBeVisible();
  await expect(page.getByText('You need to be logged in to make predictions.')).toBeVisible();
});

  test('should allow access to public pages without login', async ({ page }) => {
  // Ensure no auth is set
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  // Home page should be accessible
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Formula 1/ })).toBeVisible();
  
  // Races page should be accessible
  await page.goto('/races');
  await expect(page.getByRole('heading', { name: 'F1 Race Calendar' })).toBeVisible();
  
  // Race detail page should be accessible
  await page.goto('/races/2025-1');
  await expect(page.getByRole('heading', { name: 'Bahrain Grand Prix' })).toBeVisible();
});

  test('should show login button on home page when not authenticated', async ({ page }) => {
  // Ensure no auth is set
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  await page.goto('/');
  
  // Should show login button
  await expect(page.getByRole('button', { name: 'Login with Facebook to Start Predicting' })).toBeVisible();
});

  test('should hide login button when authenticated', async ({ page }) => {
  // Mock authenticated user
  await page.addInitScript(() => {
    window.localStorage.setItem('auth', JSON.stringify({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    }));
  });

  await page.goto('/');
  
  // Should not show login button
  await expect(page.getByRole('button', { name: 'Login with Facebook to Start Predicting' })).not.toBeVisible();
});

  test('should protect user-specific data', async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      window.localStorage.setItem('auth', JSON.stringify({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }));
    });

    await page.goto('/leaderboard');
    
    // Should show leaderboard data
    await expect(page.locator('.podium')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    // Should show user names (only visible to authenticated users)
    await expect(page.getByText('Max Fan')).toBeVisible();
    await expect(page.getByText('Lewis Fan')).toBeVisible();
  });

  test('should handle authentication state changes', async ({ page }) => {
  // Start without auth
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  await page.goto('/leaderboard');
  
  // Should show login required
  await expect(page.getByText('Login Required')).toBeVisible();
  
  // Simulate login by setting auth
  await page.evaluate(() => {
    window.localStorage.setItem('auth', JSON.stringify({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    }));
  });
  
  // Reload page
  await page.reload();
  
  // Should now show leaderboard
  await expect(page.getByRole('heading', { name: 'Season Leaderboard' })).toBeVisible();
  await expect(page.locator('.podium')).toBeVisible();
});
});
