# Test info

- Name: Prediction Page >> should show validation error if same driver is selected multiple times
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/prediction.spec.ts:105:3

# Error details

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select').first()

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/prediction.spec.ts:109:26
```

# Test source

```ts
   9 |     season: 2023,
   10 |     round: 1,
   11 |     raceName: 'Bahrain Grand Prix',
   12 |     circuitName: 'Bahrain International Circuit',
   13 |     country: 'Bahrain',
   14 |     locality: 'Sakhir',
   15 |     date: '2023-03-05',
   16 |     time: '15:00:00',
   17 |     completed: false
   18 |   };
   19 |   
   20 |   const mockDrivers = [
   21 |     { id: 'hamilton', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', constructorName: 'Mercedes' },
   22 |     { id: 'verstappen', code: 'VER', firstName: 'Max', lastName: 'Verstappen', constructorName: 'Red Bull' },
   23 |     { id: 'leclerc', code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', constructorName: 'Ferrari' },
   24 |     { id: 'perez', code: 'PER', firstName: 'Sergio', lastName: 'Perez', constructorName: 'Red Bull' },
   25 |     { id: 'russell', code: 'RUS', firstName: 'George', lastName: 'Russell', constructorName: 'Mercedes' }
   26 |   ];
   27 |   
   28 |   test.beforeEach(async ({ page }) => {
   29 |     // Mock API responses
   30 |     await page.route(`**/api/races/${RACE_ID}`, async route => {
   31 |       await route.fulfill({
   32 |         status: 200,
   33 |         contentType: 'application/json',
   34 |         body: JSON.stringify(mockRace)
   35 |       });
   36 |     });
   37 |     
   38 |     await page.route('**/api/drivers', async route => {
   39 |       await route.fulfill({
   40 |         status: 200,
   41 |         contentType: 'application/json',
   42 |         body: JSON.stringify(mockDrivers)
   43 |       });
   44 |     });
   45 |     
   46 |     // No existing prediction
   47 |     await page.route(`**/api/predictions/${RACE_ID}`, async route => {
   48 |       await route.fulfill({
   49 |         status: 200,
   50 |         contentType: 'application/json',
   51 |         body: 'null'
   52 |       });
   53 |     });
   54 |     
   55 |     // Go to prediction page
   56 |     await page.goto(`/races/${RACE_ID}/predict`);
   57 |   });
   58 |
   59 |   test('should display race information', async ({ page }) => {
   60 |     await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
   61 |     await expect(page.getByText('Predict Results')).toBeVisible();
   62 |   });
   63 |
   64 |   test('should allow selecting drivers for prediction', async ({ page }) => {
   65 |     // Get the select dropdowns (there should be 5 of them)
   66 |     const selects = page.locator('select');
   67 |     await expect(selects).toHaveCount(5);
   68 |     
   69 |     // Select drivers for each position
   70 |     await selects.nth(0).selectOption('verstappen'); // First place
   71 |     await selects.nth(1).selectOption('hamilton');   // Second place
   72 |     await selects.nth(2).selectOption('leclerc');    // Third place
   73 |     await selects.nth(3).selectOption('perez');      // Fastest lap
   74 |     await selects.nth(4).selectOption('russell');    // Driver of the day
   75 |     
   76 |     // Intercept the save prediction API call
   77 |     let requestData = null;
   78 |     await page.route('**/api/predictions/**', async route => {
   79 |       if (route.request().method() === 'POST') {
   80 |         requestData = JSON.parse(await route.request().postData() || '{}');
   81 |         await route.fulfill({
   82 |           status: 200,
   83 |           contentType: 'application/json',
   84 |           body: JSON.stringify({ success: true })
   85 |         });
   86 |       }
   87 |     });
   88 |     
   89 |     // Click the save button
   90 |     await page.getByRole('button', { name: /save prediction/i }).click();
   91 |     
   92 |     // Verify the API was called with correct data
   93 |     expect(requestData).toEqual({
   94 |       firstPlaceDriverId: 'verstappen',
   95 |       secondPlaceDriverId: 'hamilton',
   96 |       thirdPlaceDriverId: 'leclerc',
   97 |       fastestLapDriverId: 'perez',
   98 |       driverOfTheDayId: 'russell'
   99 |     });
  100 |     
  101 |     // Should show success message
  102 |     await expect(page.getByText(/prediction saved/i)).toBeVisible();
  103 |   });
  104 |
  105 |   test('should show validation error if same driver is selected multiple times', async ({ page }) => {
  106 |     const selects = page.locator('select');
  107 |     
  108 |     // Select the same driver for multiple positions
> 109 |     await selects.nth(0).selectOption('verstappen'); // First place
      |                          ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  110 |     await selects.nth(1).selectOption('verstappen'); // Second place - same as first
  111 |     
  112 |     // Click the save button
  113 |     await page.getByRole('button', { name: /save prediction/i }).click();
  114 |     
  115 |     // Should show validation error
  116 |     await expect(page.getByText(/same driver selected multiple times/i)).toBeVisible();
  117 |   });
  118 | }); 
```