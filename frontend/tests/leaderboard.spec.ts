import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  // Mock data for API responses
  const mockLeaderboard = [
    {
      userId: 1,
      userName: 'John Doe',
      profilePictureUrl: 'https://example.com/profiles/john.jpg',
      totalScore: 48
    },
    {
      userId: 2,
      userName: 'Jane Smith',
      profilePictureUrl: 'https://example.com/profiles/jane.jpg',
      totalScore: 42
    },
    {
      userId: 3,
      userName: 'Bob Johnson',
      profilePictureUrl: 'https://example.com/profiles/bob.jpg',
      totalScore: 37
    },
    {
      userId: 4,
      userName: 'Alice Brown',
      profilePictureUrl: 'https://example.com/profiles/alice.jpg',
      totalScore: 35
    },
    {
      userId: 5,
      userName: 'Charlie Wilson',
      profilePictureUrl: 'https://example.com/profiles/charlie.jpg',
      totalScore: 29
    }
  ];
  
  test('should display the leaderboard correctly', async ({ page }) => {
    // Mock API response for leaderboard
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLeaderboard)
      });
    });
    
    await page.goto('/leaderboard');
    
    // Check the page title
    await expect(page.getByRole('heading', { name: /season leaderboard/i })).toBeVisible();
    
    // Verify there are 5 leaderboard entries
    const leaderboardEntries = page.locator('.leaderboard-entry');
    await expect(leaderboardEntries).toHaveCount(5);
    
    // Verify the top 3 have special styling (podium positions)
    const podiumEntries = page.locator('.podium-position');
    await expect(podiumEntries).toHaveCount(3);
    
    // First place should be John Doe with 48 points
    const firstPlace = leaderboardEntries.first();
    await expect(firstPlace).toContainText('John Doe');
    await expect(firstPlace).toContainText('48');
    
    // Last place should be Charlie Wilson with 29 points
    const lastPlace = leaderboardEntries.last();
    await expect(lastPlace).toContainText('Charlie Wilson');
    await expect(lastPlace).toContainText('29');
  });
  
  test('should display empty state when no leaderboard data', async ({ page }) => {
    // Mock empty leaderboard response
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.goto('/leaderboard');
    
    // Should show empty state message
    await expect(page.getByText(/no predictions yet/i)).toBeVisible();
  });
  
  test('should handle error state', async ({ page }) => {
    // Mock error response
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/leaderboard');
    
    // Should show error state message
    await expect(page.getByText(/error loading leaderboard/i)).toBeVisible();
  });
}); 