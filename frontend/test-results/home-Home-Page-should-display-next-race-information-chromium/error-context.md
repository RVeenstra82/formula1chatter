# Test info

- Name: Home Page >> should display next race information
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/home.spec.ts:23:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText('Bahrain Grand Prix')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('Bahrain Grand Prix')

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/home.spec.ts:47:54
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
  - heading "Formula 1 Chatter Championship" [level=1]
  - paragraph: Predict race results and compete with friends!
  - button "Login with Facebook to Start Predicting"
  - heading "Next Race" [level=2]
  - heading "Dutch Grand Prix" [level=3]
  - paragraph: Circuit Park Zandvoort
  - paragraph: Zandvoort, Netherlands
  - paragraph: "Date: Aug 25, 2025"
  - paragraph: "Time: 3:00 PM (English time)"
  - paragraph: "Time remaining to predict: 11 days"
  - paragraph: Don't forget to save your prediction before the race starts!
  - text: Round 15 Upcoming
  - link "Make Prediction":
    - /url: /netherlands/predict
  - link "Details":
    - /url: /races/2025-15
  - heading "How It Works" [level=2]
  - text: "1"
  - paragraph: Login with your Facebook account to start participating
  - text: "2"
  - paragraph: Make predictions for upcoming races before they start
  - text: "3"
  - paragraph: Earn points based on the accuracy of your predictions
  - text: "4"
  - paragraph: Compete with friends and track your standings all season
  - link "View All Races":
    - /url: /races
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
   3 | test.describe('Home Page', () => {
   4 |   test('should show the application title', async ({ page }) => {
   5 |   await page.goto('/');
   6 |   
   7 |   // Check that the page title contains "Formula 1 Chatter"
   8 |   await expect(page).toHaveTitle(/Formula 1 Chatter/);
   9 | });
  10 |
  11 |   test('should display the navbar', async ({ page }) => {
  12 |   await page.goto('/');
  13 |   
  14 |   // Navbar should be visible
  15 |   const navbar = page.locator('nav');
  16 |   await expect(navbar).toBeVisible();
  17 |   
  18 |   // Should have navigation links
  19 |   await expect(page.locator('nav').getByRole('link', { name: 'Races' })).toBeVisible();
  20 |   await expect(page.locator('nav').getByRole('link', { name: 'Leaderboard' })).toBeVisible();
  21 | });
  22 |
  23 |   test('should display next race information', async ({ page }) => {
  24 |   // Mock the API response for getting the next race
  25 |   await page.route('**/api/races/next', async route => {
  26 |     await route.fulfill({
  27 |       status: 200,
  28 |       contentType: 'application/json',
  29 |       body: JSON.stringify({
  30 |         id: '2023-1',
  31 |         season: 2023,
  32 |         round: 1,
  33 |         raceName: 'Bahrain Grand Prix',
  34 |         circuitName: 'Bahrain International Circuit',
  35 |         country: 'Bahrain',
  36 |         locality: 'Sakhir',
  37 |         date: '2023-03-05',
  38 |         time: '15:00:00',
  39 |         completed: false
  40 |       })
  41 |     });
  42 |   });
  43 |
  44 |   await page.goto('/');
  45 |   
  46 |   // Should display the next race information
> 47 |   await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
     |                                                      ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  48 |   await expect(page.getByText('Bahrain International Circuit')).toBeVisible();
  49 |   await expect(page.getByText('Sakhir, Bahrain')).toBeVisible();
  50 | });
  51 |
  52 |   test('should navigate to prediction page when clicking on predict button', async ({ page }) => {
  53 |   // Mock the API response for getting the next race
  54 |   await page.route('**/api/races/next', async route => {
  55 |     await route.fulfill({
  56 |       status: 200,
  57 |       contentType: 'application/json',
  58 |       body: JSON.stringify({
  59 |         id: '2023-1',
  60 |         season: 2023,
  61 |         round: 1,
  62 |         raceName: 'Bahrain Grand Prix',
  63 |         circuitName: 'Bahrain International Circuit',
  64 |         country: 'Bahrain',
  65 |         locality: 'Sakhir',
  66 |         date: '2023-03-05',
  67 |         time: '15:00:00',
  68 |         completed: false
  69 |       })
  70 |     });
  71 |   });
  72 |
  73 |   await page.goto('/');
  74 |   
  75 |   // Click the predict button (Make Prediction)
  76 |   await page.getByRole('link', { name: /make prediction/i }).click();
  77 |   
  78 |   // Should navigate to the prediction page
  79 |   await expect(page).toHaveURL(/.*\/bahrain\/predict/);
  80 | });
  81 | }); 
```