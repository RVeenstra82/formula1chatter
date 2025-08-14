import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to simulate logged in user
    await page.addInitScript(() => {
      window.localStorage.setItem('auth', JSON.stringify({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }));
    });
  });

  test('should require login to view leaderboard', async ({ page }) => {
  // Clear auth to simulate not logged in
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth');
  });

  await page.goto('/leaderboard');
  
  // Should show login required message (in English by default)
  await expect(page.getByRole('heading', { name: 'Login Required' })).toBeVisible();
  await expect(page.getByText('You need to be logged in to view the leaderboard.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

  test('should display season leaderboard by default', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Check the page title
  await expect(page.getByRole('heading', { name: 'Season Leaderboard' })).toBeVisible();
  
  // Should show season total button as active
  await expect(page.getByRole('button', { name: 'Season Total' })).toHaveClass(/btn-primary/);
  
  // Should show podium with top 3
  await expect(page.locator('.podium')).toBeVisible();
  
  // Should show leaderboard table
  await expect(page.locator('table')).toBeVisible();
  
  // Should show position, user, and points columns
  await expect(page.getByText('Position')).toBeVisible();
  await expect(page.getByText('User')).toBeVisible();
  await expect(page.getByText('Points')).toBeVisible();
});

  test('should switch to race results view', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Click on race results button
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Should show race results button as active
  await expect(page.getByRole('button', { name: 'Race Results' })).toHaveClass(/btn-primary/);
  
  // Should show race selector sidebar
  await expect(page.getByText('Select Race')).toBeVisible();
  
  // Should show completed races in sidebar
  await expect(page.getByText('Belgian Grand Prix')).toBeVisible();
  await expect(page.getByText('Hungarian Grand Prix')).toBeVisible();
  await expect(page.getByText('British Grand Prix')).toBeVisible();
  
  // Should show position change column
  await expect(page.getByText('Change')).toBeVisible();
});

  test('should display race-specific results when race is selected', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Click on Belgian GP (should be first in the list)
  await page.getByText('Belgian Grand Prix').click();
  
  // Should show race results
  await expect(page.locator('.podium')).toBeVisible();
  await expect(page.locator('table')).toBeVisible();
  
  // Should show position change indicators
  await expect(page.locator('.position-change')).toBeVisible();
});

  test('should show compact race buttons in sidebar', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Check that race buttons are compact (date next to race name)
  const raceButton = page.locator('button').filter({ hasText: 'Belgian Grand Prix' });
  await expect(raceButton).toBeVisible();
  
  // Should show date in the same line as race name
  await expect(raceButton).toContainText('28/7/2025');
});

  test('should show selected race with red background', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Click on a race
  await page.getByText('Belgian Grand Prix').click();
  
  // Should have red background for selected race
  const selectedRace = page.locator('button').filter({ hasText: 'Belgian Grand Prix' });
  await expect(selectedRace).toHaveClass(/bg-f1-red/);
});

  test('should display empty state for race with no predictions', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Switch to race results view
  await page.getByRole('button', { name: 'Race Results' }).click();
  
  // Mock empty race results
  await page.route('**/api/predictions/race/*/results', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });
  
  // Click on a race
  await page.getByText('Belgian Grand Prix').click();
  
  // Should show empty state message
  await expect(page.getByText('No further predictions made for this race.')).toBeVisible();
});

  test('should display empty state for season with no results', async ({ page }) => {
  // Use test login for authenticated access
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
  
  // Mock empty season leaderboard
  await page.route('**/api/predictions/leaderboard', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });
  
  // Should show empty state message
  await expect(page.getByText('No results available for this season yet.')).toBeVisible();
});

  test('should handle loading states', async ({ page }) => {
  // Use test login for authenticated access
  await page.addInitScript(() => {
    window.localStorage.setItem('auth', JSON.stringify({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    }));
  });

  // Mock slow API response
  await page.route('**/api/predictions/leaderboard', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.goto('/leaderboard');
  
  // Should show loading spinner
  await expect(page.locator('.animate-spin')).toBeVisible();
});

  test('should handle authentication loading state', async ({ page }) => {
    // Mock slow auth check
    await page.addInitScript(() => {
      // Simulate slow auth loading
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        if (args[0].includes('/auth/user')) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return originalFetch(...args);
      };
    });

    await page.goto('/leaderboard');
    
    // Should show loading spinner during auth check
    await expect(page.locator('.animate-spin')).toBeVisible();
  });
}); 