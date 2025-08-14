# Test info

- Name: Leaderboard Page >> should display season leaderboard by default
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:31:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { name: 'Season Leaderboard' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Season Leaderboard' })

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:46:75
```

# Page snapshot

```yaml
- navigation:
  - link "F1 Chatter Championship":
    - /url: /
  - link "Races":
    - /url: /races
  - link "Leaderboard":
    - /url: /leaderboard
  - text: "Language:"
  - button "EN"
  - button "NL"
  - button "Login with Facebook":
    - img
    - text: Login with Facebook
  - button "Test Login"
- main:
  - heading "leaderboard.loginRequired" [level=1]
  - paragraph: leaderboard.loginToView
  - button "Login"
- contentinfo:
  - text: F1 Chatter Championship © 2025
  - link "Privacy Policy":
    - /url: /privacy-policy
  - link "Data Deletion":
    - /url: /data-deletion
  - link "GitHub":
    - /url: https://github.com/Rick-Ritense/formula1chatter
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Leaderboard Page', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Mock authentication to simulate logged in user
   6 |     await page.addInitScript(() => {
   7 |       window.localStorage.setItem('auth', JSON.stringify({
   8 |         user: {
   9 |           id: 1,
   10 |           name: 'Test User',
   11 |           email: 'test@example.com'
   12 |         }
   13 |       }));
   14 |     });
   15 |   });
   16 |
   17 |   test('should require login to view leaderboard', async ({ page }) => {
   18 |   // Clear auth to simulate not logged in
   19 |   await page.addInitScript(() => {
   20 |     window.localStorage.removeItem('auth');
   21 |   });
   22 |
   23 |   await page.goto('/leaderboard');
   24 |   
   25 |   // Should show login required message (in English by default)
   26 |   await expect(page.getByRole('heading', { name: 'Login Required' })).toBeVisible();
   27 |   await expect(page.getByText('You need to be logged in to view the leaderboard.')).toBeVisible();
   28 |   await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
   29 | });
   30 |
   31 |   test('should display season leaderboard by default', async ({ page }) => {
   32 |   // Use test login for authenticated access
   33 |   await page.addInitScript(() => {
   34 |     window.localStorage.setItem('auth', JSON.stringify({
   35 |       user: {
   36 |         id: 1,
   37 |         name: 'Test User',
   38 |         email: 'test@example.com'
   39 |       }
   40 |     }));
   41 |   });
   42 |
   43 |   await page.goto('/leaderboard');
   44 |   
   45 |   // Check the page title
>  46 |   await expect(page.getByRole('heading', { name: 'Season Leaderboard' })).toBeVisible();
      |                                                                           ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   47 |   
   48 |   // Should show season total button as active
   49 |   await expect(page.getByRole('button', { name: 'Season Total' })).toHaveClass(/btn-primary/);
   50 |   
   51 |   // Should show podium with top 3
   52 |   await expect(page.locator('.podium')).toBeVisible();
   53 |   
   54 |   // Should show leaderboard table
   55 |   await expect(page.locator('table')).toBeVisible();
   56 |   
   57 |   // Should show position, user, and points columns
   58 |   await expect(page.getByText('Position')).toBeVisible();
   59 |   await expect(page.getByText('User')).toBeVisible();
   60 |   await expect(page.getByText('Points')).toBeVisible();
   61 | });
   62 |
   63 |   test('should switch to race results view', async ({ page }) => {
   64 |   // Use test login for authenticated access
   65 |   await page.addInitScript(() => {
   66 |     window.localStorage.setItem('auth', JSON.stringify({
   67 |       user: {
   68 |         id: 1,
   69 |         name: 'Test User',
   70 |         email: 'test@example.com'
   71 |       }
   72 |     }));
   73 |   });
   74 |
   75 |   await page.goto('/leaderboard');
   76 |   
   77 |   // Click on race results button
   78 |   await page.getByRole('button', { name: 'Race Results' }).click();
   79 |   
   80 |   // Should show race results button as active
   81 |   await expect(page.getByRole('button', { name: 'Race Results' })).toHaveClass(/btn-primary/);
   82 |   
   83 |   // Should show race selector sidebar
   84 |   await expect(page.getByText('Select Race')).toBeVisible();
   85 |   
   86 |   // Should show completed races in sidebar
   87 |   await expect(page.getByText('Belgian Grand Prix')).toBeVisible();
   88 |   await expect(page.getByText('Hungarian Grand Prix')).toBeVisible();
   89 |   await expect(page.getByText('British Grand Prix')).toBeVisible();
   90 |   
   91 |   // Should show position change column
   92 |   await expect(page.getByText('Change')).toBeVisible();
   93 | });
   94 |
   95 |   test('should display race-specific results when race is selected', async ({ page }) => {
   96 |   // Use test login for authenticated access
   97 |   await page.addInitScript(() => {
   98 |     window.localStorage.setItem('auth', JSON.stringify({
   99 |       user: {
  100 |         id: 1,
  101 |         name: 'Test User',
  102 |         email: 'test@example.com'
  103 |       }
  104 |     }));
  105 |   });
  106 |
  107 |   await page.goto('/leaderboard');
  108 |   
  109 |   // Switch to race results view
  110 |   await page.getByRole('button', { name: 'Race Results' }).click();
  111 |   
  112 |   // Click on Belgian GP (should be first in the list)
  113 |   await page.getByText('Belgian Grand Prix').click();
  114 |   
  115 |   // Should show race results
  116 |   await expect(page.locator('.podium')).toBeVisible();
  117 |   await expect(page.locator('table')).toBeVisible();
  118 |   
  119 |   // Should show position change indicators
  120 |   await expect(page.locator('.position-change')).toBeVisible();
  121 | });
  122 |
  123 |   test('should show compact race buttons in sidebar', async ({ page }) => {
  124 |   // Use test login for authenticated access
  125 |   await page.addInitScript(() => {
  126 |     window.localStorage.setItem('auth', JSON.stringify({
  127 |       user: {
  128 |         id: 1,
  129 |         name: 'Test User',
  130 |         email: 'test@example.com'
  131 |       }
  132 |     }));
  133 |   });
  134 |
  135 |   await page.goto('/leaderboard');
  136 |   
  137 |   // Switch to race results view
  138 |   await page.getByRole('button', { name: 'Race Results' }).click();
  139 |   
  140 |   // Check that race buttons are compact (date next to race name)
  141 |   const raceButton = page.locator('button').filter({ hasText: 'Belgian Grand Prix' });
  142 |   await expect(raceButton).toBeVisible();
  143 |   
  144 |   // Should show date in the same line as race name
  145 |   await expect(raceButton).toContainText('28/7/2025');
  146 | });
```