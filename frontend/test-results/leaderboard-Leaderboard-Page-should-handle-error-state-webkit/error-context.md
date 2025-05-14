# Test info

- Name: Leaderboard Page >> should handle error state
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:88:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText(/error loading leaderboard/i)
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText(/error loading leaderboard/i)

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:101:64
```

# Page snapshot

```yaml
- text: "[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration. at We (/Users/rickveenstra/workspace/cursor/formula1chatter/frontend/node_modules/tailwindcss/dist/lib.js:35:2121) at LazyResult.runOnRoot (/Users/rickveenstra/workspace/cursor/formula1chatter/frontend/node_modules/postcss/lib/lazy-result.js:361:16) at LazyResult.runAsync (/Users/rickveenstra/workspace/cursor/formula1chatter/frontend/node_modules/postcss/lib/lazy-result.js:290:26) at LazyResult.async (/Users/rickveenstra/workspace/cursor/formula1chatter/frontend/node_modules/postcss/lib/lazy-result.js:192:30) at LazyResult.then (/Users/rickveenstra/workspace/cursor/formula1chatter/frontend/node_modules/postcss/lib/lazy-result.js:436:17 Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Leaderboard Page', () => {
   4 |   // Mock data for API responses
   5 |   const mockLeaderboard = [
   6 |     {
   7 |       userId: 1,
   8 |       userName: 'John Doe',
   9 |       profilePictureUrl: 'https://example.com/profiles/john.jpg',
   10 |       totalScore: 48
   11 |     },
   12 |     {
   13 |       userId: 2,
   14 |       userName: 'Jane Smith',
   15 |       profilePictureUrl: 'https://example.com/profiles/jane.jpg',
   16 |       totalScore: 42
   17 |     },
   18 |     {
   19 |       userId: 3,
   20 |       userName: 'Bob Johnson',
   21 |       profilePictureUrl: 'https://example.com/profiles/bob.jpg',
   22 |       totalScore: 37
   23 |     },
   24 |     {
   25 |       userId: 4,
   26 |       userName: 'Alice Brown',
   27 |       profilePictureUrl: 'https://example.com/profiles/alice.jpg',
   28 |       totalScore: 35
   29 |     },
   30 |     {
   31 |       userId: 5,
   32 |       userName: 'Charlie Wilson',
   33 |       profilePictureUrl: 'https://example.com/profiles/charlie.jpg',
   34 |       totalScore: 29
   35 |     }
   36 |   ];
   37 |   
   38 |   test('should display the leaderboard correctly', async ({ page }) => {
   39 |     // Mock API response for leaderboard
   40 |     await page.route('**/api/leaderboard', async route => {
   41 |       await route.fulfill({
   42 |         status: 200,
   43 |         contentType: 'application/json',
   44 |         body: JSON.stringify(mockLeaderboard)
   45 |       });
   46 |     });
   47 |     
   48 |     await page.goto('/leaderboard');
   49 |     
   50 |     // Check the page title
   51 |     await expect(page.getByRole('heading', { name: /season leaderboard/i })).toBeVisible();
   52 |     
   53 |     // Verify there are 5 leaderboard entries
   54 |     const leaderboardEntries = page.locator('.leaderboard-entry');
   55 |     await expect(leaderboardEntries).toHaveCount(5);
   56 |     
   57 |     // Verify the top 3 have special styling (podium positions)
   58 |     const podiumEntries = page.locator('.podium-position');
   59 |     await expect(podiumEntries).toHaveCount(3);
   60 |     
   61 |     // First place should be John Doe with 48 points
   62 |     const firstPlace = leaderboardEntries.first();
   63 |     await expect(firstPlace).toContainText('John Doe');
   64 |     await expect(firstPlace).toContainText('48');
   65 |     
   66 |     // Last place should be Charlie Wilson with 29 points
   67 |     const lastPlace = leaderboardEntries.last();
   68 |     await expect(lastPlace).toContainText('Charlie Wilson');
   69 |     await expect(lastPlace).toContainText('29');
   70 |   });
   71 |   
   72 |   test('should display empty state when no leaderboard data', async ({ page }) => {
   73 |     // Mock empty leaderboard response
   74 |     await page.route('**/api/leaderboard', async route => {
   75 |       await route.fulfill({
   76 |         status: 200,
   77 |         contentType: 'application/json',
   78 |         body: JSON.stringify([])
   79 |       });
   80 |     });
   81 |     
   82 |     await page.goto('/leaderboard');
   83 |     
   84 |     // Should show empty state message
   85 |     await expect(page.getByText(/no predictions yet/i)).toBeVisible();
   86 |   });
   87 |   
   88 |   test('should handle error state', async ({ page }) => {
   89 |     // Mock error response
   90 |     await page.route('**/api/leaderboard', async route => {
   91 |       await route.fulfill({
   92 |         status: 500,
   93 |         contentType: 'application/json',
   94 |         body: JSON.stringify({ error: 'Internal server error' })
   95 |       });
   96 |     });
   97 |     
   98 |     await page.goto('/leaderboard');
   99 |     
  100 |     // Should show error state message
> 101 |     await expect(page.getByText(/error loading leaderboard/i)).toBeVisible();
      |                                                                ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  102 |   });
  103 | }); 
```