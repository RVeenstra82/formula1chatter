import { test, expect } from '@playwright/test';

test.describe('Prediction Page', () => {
  const RACE_ID = '2023-1';
  
  // Mock data for API responses
  const mockRace = {
    id: RACE_ID,
    season: 2023,
    round: 1,
    raceName: 'Bahrain Grand Prix',
    circuitName: 'Bahrain International Circuit',
    country: 'Bahrain',
    locality: 'Sakhir',
    date: '2023-03-05',
    time: '15:00:00',
    completed: false
  };
  
  const mockDrivers = [
    { id: 'hamilton', code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', constructorName: 'Mercedes' },
    { id: 'verstappen', code: 'VER', firstName: 'Max', lastName: 'Verstappen', constructorName: 'Red Bull' },
    { id: 'leclerc', code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', constructorName: 'Ferrari' },
    { id: 'perez', code: 'PER', firstName: 'Sergio', lastName: 'Perez', constructorName: 'Red Bull' },
    { id: 'russell', code: 'RUS', firstName: 'George', lastName: 'Russell', constructorName: 'Mercedes' }
  ];
  
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route(`**/api/races/${RACE_ID}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRace)
      });
    });
    
    await page.route('**/api/drivers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDrivers)
      });
    });
    
    // No existing prediction
    await page.route(`**/api/predictions/${RACE_ID}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null'
      });
    });
    
    // Go to prediction page
    await page.goto(`/races/${RACE_ID}/predict`);
  });

  test('should display race information', async ({ page }) => {
    await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
    await expect(page.getByText('Predict Results')).toBeVisible();
  });

  test('should allow selecting drivers for prediction', async ({ page }) => {
    // Get the select dropdowns (there should be 5 of them)
    const selects = page.locator('select');
    await expect(selects).toHaveCount(5);
    
    // Select drivers for each position
    await selects.nth(0).selectOption('verstappen'); // First place
    await selects.nth(1).selectOption('hamilton');   // Second place
    await selects.nth(2).selectOption('leclerc');    // Third place
    await selects.nth(3).selectOption('perez');      // Fastest lap
    await selects.nth(4).selectOption('russell');    // Driver of the day
    
    // Intercept the save prediction API call
    let requestData = null;
    await page.route('**/api/predictions/**', async route => {
      if (route.request().method() === 'POST') {
        requestData = JSON.parse(await route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });
    
    // Click the save button
    await page.getByRole('button', { name: /save prediction/i }).click();
    
    // Verify the API was called with correct data
    expect(requestData).toEqual({
      firstPlaceDriverId: 'verstappen',
      secondPlaceDriverId: 'hamilton',
      thirdPlaceDriverId: 'leclerc',
      fastestLapDriverId: 'perez',
      driverOfTheDayId: 'russell'
    });
    
    // Should show success message
    await expect(page.getByText(/prediction saved/i)).toBeVisible();
  });

  test('should show validation error if same driver is selected multiple times', async ({ page }) => {
    const selects = page.locator('select');
    
    // Select the same driver for multiple positions
    await selects.nth(0).selectOption('verstappen'); // First place
    await selects.nth(1).selectOption('verstappen'); // Second place - same as first
    
    // Click the save button
    await page.getByRole('button', { name: /save prediction/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/same driver selected multiple times/i)).toBeVisible();
  });
}); 