# Test info

- Name: Home Page >> should display the navbar
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/home.spec.ts:11:3

# Error details

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/home.spec.ts:12:16
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
   3 | test.describe('Home Page', () => {
   4 |   test('should show the application title', async ({ page }) => {
   5 |     await page.goto('/');
   6 |     
   7 |     // Check that the page title contains "F1 Chatter"
   8 |     await expect(page).toHaveTitle(/F1 Chatter/);
   9 |   });
  10 |
  11 |   test('should display the navbar', async ({ page }) => {
> 12 |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  13 |     
  14 |     // Navbar should be visible
  15 |     const navbar = page.locator('nav');
  16 |     await expect(navbar).toBeVisible();
  17 |     
  18 |     // Should have navigation links
  19 |     await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  20 |     await expect(page.getByRole('link', { name: /races/i })).toBeVisible();
  21 |     await expect(page.getByRole('link', { name: /leaderboard/i })).toBeVisible();
  22 |   });
  23 |
  24 |   test('should display next race information', async ({ page }) => {
  25 |     // Mock the API response for getting the next race
  26 |     await page.route('**/api/races/next', async route => {
  27 |       await route.fulfill({
  28 |         status: 200,
  29 |         contentType: 'application/json',
  30 |         body: JSON.stringify({
  31 |           id: '2023-1',
  32 |           season: 2023,
  33 |           round: 1,
  34 |           raceName: 'Bahrain Grand Prix',
  35 |           circuitName: 'Bahrain International Circuit',
  36 |           country: 'Bahrain',
  37 |           locality: 'Sakhir',
  38 |           date: '2023-03-05',
  39 |           time: '15:00:00',
  40 |           completed: false
  41 |         })
  42 |       });
  43 |     });
  44 |
  45 |     await page.goto('/');
  46 |     
  47 |     // Should display the next race information
  48 |     await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
  49 |     await expect(page.getByText('Bahrain International Circuit')).toBeVisible();
  50 |     await expect(page.getByText('Bahrain, Sakhir')).toBeVisible();
  51 |   });
  52 |
  53 |   test('should navigate to prediction page when clicking on predict button', async ({ page }) => {
  54 |     // Mock the API response for getting the next race
  55 |     await page.route('**/api/races/next', async route => {
  56 |       await route.fulfill({
  57 |         status: 200,
  58 |         contentType: 'application/json',
  59 |         body: JSON.stringify({
  60 |           id: '2023-1',
  61 |           season: 2023,
  62 |           round: 1,
  63 |           raceName: 'Bahrain Grand Prix',
  64 |           circuitName: 'Bahrain International Circuit',
  65 |           country: 'Bahrain',
  66 |           locality: 'Sakhir',
  67 |           date: '2023-03-05',
  68 |           time: '15:00:00',
  69 |           completed: false
  70 |         })
  71 |       });
  72 |     });
  73 |
  74 |     await page.goto('/');
  75 |     
  76 |     // Click the predict button
  77 |     await page.getByRole('button', { name: /predict/i }).click();
  78 |     
  79 |     // Should navigate to the prediction page
  80 |     await expect(page).toHaveURL(/.*\/races\/2023-1\/predict/);
  81 |   });
  82 | }); 
```