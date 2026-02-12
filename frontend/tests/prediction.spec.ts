import { test, expect, Page } from '@playwright/test';

// ── Mock data ──────────────────────────────────────────────────────────

const testUser = {
  id: 0,
  name: 'Test User',
  email: 'testuser@f1chatter.com',
  profilePictureUrl: null,
  isAdmin: true,
};

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 23);
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

const pastDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

const futureRace = {
  id: '2026-1',
  season: 2026,
  round: 1,
  raceName: 'Australian Grand Prix',
  circuitName: 'Albert Park Grand Prix Circuit',
  country: 'Australia',
  locality: 'Melbourne',
  date: futureDate(),
  time: '04:00:00',
  practice1Date: null,
  practice1Time: null,
  practice2Date: null,
  practice2Time: null,
  practice3Date: null,
  practice3Time: null,
  qualifyingDate: null,
  qualifyingTime: null,
  isSprintWeekend: false,
  sprintDate: null,
  sprintTime: null,
  sprintQualifyingDate: null,
  sprintQualifyingTime: null,
  firstPlaceDriverId: null,
  secondPlaceDriverId: null,
  thirdPlaceDriverId: null,
  fastestLapDriverId: null,
  driverOfTheDayId: null,
  completed: false,
};

const startedRace = {
  ...futureRace,
  id: '2026-started',
  raceName: 'Race In Progress',
  date: pastDate(),
  time: '14:00:00',
  completed: false,
};

const completedRace = {
  ...futureRace,
  id: '2025-prev',
  season: 2025,
  raceName: 'Previous Grand Prix',
  date: pastDate(),
  time: '14:00:00',
  completed: true,
  firstPlaceDriverId: 'verstappen',
  secondPlaceDriverId: 'norris',
  thirdPlaceDriverId: 'leclerc',
  fastestLapDriverId: 'verstappen',
  driverOfTheDayId: 'norris',
};

const drivers = [
  { id: 'verstappen', code: 'VER', number: '1', firstName: 'Max', lastName: 'Verstappen', nationality: 'Dutch', constructorId: 'red_bull', constructorName: 'Red Bull', profilePictureUrl: null },
  { id: 'norris', code: 'NOR', number: '4', firstName: 'Lando', lastName: 'Norris', nationality: 'British', constructorId: 'mclaren', constructorName: 'McLaren', profilePictureUrl: null },
  { id: 'leclerc', code: 'LEC', number: '16', firstName: 'Charles', lastName: 'Leclerc', nationality: 'Monegasque', constructorId: 'ferrari', constructorName: 'Ferrari', profilePictureUrl: null },
  { id: 'hamilton', code: 'HAM', number: '44', firstName: 'Lewis', lastName: 'Hamilton', nationality: 'British', constructorId: 'ferrari', constructorName: 'Ferrari', profilePictureUrl: null },
  { id: 'russell', code: 'RUS', number: '63', firstName: 'George', lastName: 'Russell', nationality: 'British', constructorId: 'mercedes', constructorName: 'Mercedes', profilePictureUrl: null },
];

const existingPrediction = {
  firstPlaceDriverId: 'verstappen',
  secondPlaceDriverId: 'norris',
  thirdPlaceDriverId: 'leclerc',
  fastestLapDriverId: 'hamilton',
  driverOfTheDayId: 'russell',
};

const raceResults = [
  {
    userId: 0,
    userName: 'Test User',
    profilePictureUrl: null,
    score: 7,
    prediction: existingPrediction,
    seasonPosition: 1,
    previousSeasonPosition: 1,
  },
  {
    userId: 2,
    userName: 'Other User',
    profilePictureUrl: null,
    score: 3,
    prediction: {
      firstPlaceDriverId: 'norris',
      secondPlaceDriverId: 'verstappen',
      thirdPlaceDriverId: 'leclerc',
      fastestLapDriverId: 'norris',
      driverOfTheDayId: 'norris',
    },
    seasonPosition: 2,
    previousSeasonPosition: 2,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

/** Set up authenticated test user in localStorage before navigation */
async function authenticateUser(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 0,
      name: 'Test User',
      email: 'testuser@f1chatter.com',
      profilePictureUrl: null,
      isAdmin: true,
    }));
  });
}

/** Set up standard API mocks for prediction tests */
async function setupApiMocks(
  page: Page,
  options: {
    race?: typeof futureRace;
    existingPrediction?: typeof existingPrediction | null;
    saveSuccess?: boolean;
  } = {}
) {
  const {
    race = futureRace,
    existingPrediction: prediction = null,
    saveSuccess = true,
  } = options;

  // Auth user endpoint
  await page.route('**/api/auth/user', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testUser) })
  );

  await page.route('**/api/auth/status', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
  );

  // Race data
  await page.route(`**/api/races/${race.id}`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(race) })
  );

  // Drivers
  await page.route(`**/api/drivers/active/${race.id}`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(drivers) })
  );

  // Existing prediction (null = no prediction yet)
  await page.route(`**/api/predictions/user/*/race/${race.id}`, route => {
    if (prediction) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prediction) });
    } else {
      route.fulfill({ status: 404, body: '' });
    }
  });

  // Save prediction
  await page.route(`**/api/predictions/${race.id}`, route => {
    if (route.request().method() === 'POST') {
      if (saveSuccess) {
        route.fulfill({ status: 200, contentType: 'application/json', body: route.request().postData() || '{}' });
      } else {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Predictions are no longer accepted. Race starts within 5 minutes or has already started.' }),
        });
      }
    } else {
      route.continue();
    }
  });

  // Leaderboard (needed by some page navigations)
  await page.route('**/api/predictions/leaderboard*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  );
}

/** Select a driver in a react-select dropdown by typing into the input and pressing Enter */
async function selectDriver(page: Page, selectId: string, driverName: string) {
  // Focus the react-select input
  const input = page.locator(`#${selectId}`);
  await input.click();
  // Clear any existing value and type the driver name
  await input.fill('');
  await input.type(driverName, { delay: 30 });
  // Wait for the filtered option to appear, then press Enter to select it
  await page.waitForTimeout(200);
  await input.press('Enter');
}

// ── Tests ──────────────────────────────────────────────────────────────

test.describe('Prediction Page', () => {
  test('should load prediction page for a race', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page);
    await page.goto(`/races/${futureRace.id}/predict`);

    await expect(page).toHaveTitle(/Formula 1 Chatter/);
    await expect(page).toHaveURL(/.*\/predict/);
  });

  test('should show login prompt when not authenticated', async ({ page }) => {
    // Don't authenticate, but mock the auth check to fail
    await page.route('**/api/auth/user', route =>
      route.fulfill({ status: 401, body: '' })
    );
    await page.route('**/api/auth/status', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: false }) })
    );
    await page.route(`**/api/races/${futureRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(futureRace) })
    );
    await page.route(`**/api/drivers/active/${futureRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(drivers) })
    );

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // Should show login required message
    await expect(page.getByText(/login|inloggen/i).first()).toBeVisible();
  });
});

test.describe('Making a prediction', () => {
  test('should display prediction form with driver selects for upcoming race', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page);
    await page.goto(`/races/${futureRace.id}/predict`);

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Should show the race name
    await expect(page.getByText('Australian Grand Prix').first()).toBeVisible();

    // Should show prediction form with all 5 selects
    await expect(page.locator('#first-place')).toBeVisible();
    await expect(page.locator('#second-place')).toBeVisible();
    await expect(page.locator('#third-place')).toBeVisible();
    await expect(page.locator('#fastest-lap')).toBeVisible();
    await expect(page.locator('#driver-of-the-day')).toBeVisible();

    // Submit button should be visible and enabled
    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should submit a new prediction successfully', async ({ page }) => {
    await authenticateUser(page);

    let savedPrediction: Record<string, string> | null = null;
    await setupApiMocks(page);

    // Override save route to capture the posted data
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        savedPrediction = JSON.parse(route.request().postData() || '{}');
        route.fulfill({ status: 200, contentType: 'application/json', body: route.request().postData() || '{}' });
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // Select drivers for each position
    await selectDriver(page, 'first-place', 'Max Verstappen');
    await selectDriver(page, 'second-place', 'Lando Norris');
    await selectDriver(page, 'third-place', 'Charles Leclerc');
    await selectDriver(page, 'fastest-lap', 'Lewis Hamilton');
    await selectDriver(page, 'driver-of-the-day', 'George Russell');

    // Click submit
    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Verify the prediction was submitted with the right data
    await expect(() => {
      expect(savedPrediction).not.toBeNull();
      expect(savedPrediction!.firstPlaceDriverId).toBe('verstappen');
      expect(savedPrediction!.secondPlaceDriverId).toBe('norris');
      expect(savedPrediction!.thirdPlaceDriverId).toBe('leclerc');
      expect(savedPrediction!.fastestLapDriverId).toBe('hamilton');
      expect(savedPrediction!.driverOfTheDayId).toBe('russell');
    }).toPass({ timeout: 5000 });
  });
});

test.describe('Modifying a prediction', () => {
  test('should load existing prediction into form', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page, { existingPrediction });
    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // The form should have pre-filled values
    // react-select shows the selected value as text in the single-value container
    await expect(page.getByText('Max Verstappen').first()).toBeVisible();
    await expect(page.getByText('Lando Norris').first()).toBeVisible();
    await expect(page.getByText('Charles Leclerc').first()).toBeVisible();
  });

  test('should update an existing prediction', async ({ page }) => {
    await authenticateUser(page);

    let savedPrediction: Record<string, string> | null = null;
    await setupApiMocks(page, { existingPrediction });

    // Override save route to capture the posted data
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        savedPrediction = JSON.parse(route.request().postData() || '{}');
        route.fulfill({ status: 200, contentType: 'application/json', body: route.request().postData() || '{}' });
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // Existing prediction should be loaded - change the first place to Hamilton
    // Focus the input, clear it with keyboard shortcuts, then type new driver
    const firstPlaceInput = page.locator('#first-place');
    await firstPlaceInput.click();
    // Backspace clears the selected value in react-select
    await firstPlaceInput.press('Backspace');
    await firstPlaceInput.type('Lewis Hamilton', { delay: 30 });
    await page.waitForTimeout(200);
    await firstPlaceInput.press('Enter');

    // Submit the updated prediction
    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Verify the prediction was submitted with the updated data
    await expect(() => {
      expect(savedPrediction).not.toBeNull();
      expect(savedPrediction!.firstPlaceDriverId).toBe('hamilton');
    }).toPass({ timeout: 5000 });
  });
});

test.describe('Race started - predictions locked', () => {
  test('should show race started message and disable form', async ({ page }) => {
    await authenticateUser(page);

    // Mock auth
    await page.route('**/api/auth/user', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testUser) })
    );
    await page.route('**/api/auth/status', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
    );
    // Mock race that has started
    await page.route(`**/api/races/${startedRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(startedRace) })
    );
    await page.route(`**/api/drivers/active/${startedRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(drivers) })
    );

    await page.goto(`/races/${startedRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // PredictionPage redirects to a "race started" view with no form
    await expect(page.getByText(/started|begonnen|in progress|bezig/i).first()).toBeVisible();

    // Submit button should NOT be visible (form is replaced by info message)
    const submitButton = page.getByRole('button', { name: /submit prediction|indienen/i });
    await expect(submitButton).not.toBeVisible();
  });

  test('should show error when backend rejects late prediction', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page, { saveSuccess: false });
    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // Fill in prediction
    await selectDriver(page, 'first-place', 'Max Verstappen');
    await selectDriver(page, 'second-place', 'Lando Norris');
    await selectDriver(page, 'third-place', 'Charles Leclerc');
    await selectDriver(page, 'fastest-lap', 'Lewis Hamilton');
    await selectDriver(page, 'driver-of-the-day', 'George Russell');

    // Submit
    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Should show the backend error message
    await expect(page.getByText(/no longer accepted|niet meer/i).first()).toBeVisible();
  });
});

test.describe('Previous race - read-only predictions', () => {
  test('should show completed race message on prediction page', async ({ page }) => {
    await authenticateUser(page);

    // Mock auth
    await page.route('**/api/auth/user', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testUser) })
    );
    await page.route('**/api/auth/status', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
    );
    // Mock completed race
    await page.route(`**/api/races/${completedRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(completedRace) })
    );

    await page.goto(`/races/${completedRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // PredictionPage shows a "race complete" view
    await expect(page.getByText(/complete|voltooid/i).first()).toBeVisible();

    // Should NOT show the prediction form submit button
    const submitButton = page.getByRole('button', { name: /submit prediction|indienen/i });
    await expect(submitButton).not.toBeVisible();

    // Should show link to results
    const resultsLink = page.getByRole('link', { name: /results|resultaten/i });
    await expect(resultsLink).toBeVisible();
  });

  test('should display race results with predictions read-only', async ({ page }) => {
    await authenticateUser(page);

    // Mock auth
    await page.route('**/api/auth/user', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testUser) })
    );
    await page.route('**/api/auth/status', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
    );
    // Mock completed race and results
    await page.route(`**/api/races/${completedRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(completedRace) })
    );
    await page.route(`**/api/predictions/race/${completedRace.id}/results`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(raceResults) })
    );
    await page.route(`**/api/drivers/active/${completedRace.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(drivers) })
    );
    await page.route('**/api/predictions/leaderboard*', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );

    await page.goto(`/races/${completedRace.id}/results`);
    await page.waitForLoadState('networkidle');

    // Should show the results page with user scores
    await expect(page.getByText('Test User').first()).toBeVisible();

    // Should NOT have any editable prediction form elements
    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await expect(submitButton).not.toBeVisible();
  });
});

// ── Unhappy flow tests ─────────────────────────────────────────────────

test.describe('Error handling - network and server errors', () => {
  test('should show error when network fails during save', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page);

    // Override save route to simulate network failure
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        route.abort('connectionrefused');
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    await selectDriver(page, 'first-place', 'Max Verstappen');
    await selectDriver(page, 'second-place', 'Lando Norris');
    await selectDriver(page, 'third-place', 'Charles Leclerc');
    await selectDriver(page, 'fastest-lap', 'Lewis Hamilton');
    await selectDriver(page, 'driver-of-the-day', 'George Russell');

    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Should show a generic error message (not "noMorePredictions")
    await expect(page.locator('.text-f1-red, [class*="red"]').first()).toBeVisible();
  });

  test('should show error when server returns 500', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page);

    // Override save route to simulate server error
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    await selectDriver(page, 'first-place', 'Max Verstappen');
    await selectDriver(page, 'second-place', 'Lando Norris');
    await selectDriver(page, 'third-place', 'Charles Leclerc');
    await selectDriver(page, 'fastest-lap', 'Lewis Hamilton');
    await selectDriver(page, 'driver-of-the-day', 'George Russell');

    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Should show an error message
    await expect(page.locator('.text-f1-red, [class*="red"]').first()).toBeVisible();
  });

  test('should show error when auth token expires during save (401)', async ({ page }) => {
    await authenticateUser(page);
    await setupApiMocks(page);

    // Override save route to simulate expired token
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 401, body: '' });
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    await selectDriver(page, 'first-place', 'Max Verstappen');
    await selectDriver(page, 'second-place', 'Lando Norris');
    await selectDriver(page, 'third-place', 'Charles Leclerc');
    await selectDriver(page, 'fastest-lap', 'Lewis Hamilton');
    await selectDriver(page, 'driver-of-the-day', 'George Russell');

    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Should show an error (the auth interceptor clears the token)
    await expect(page.locator('.text-f1-red, [class*="red"]').first()).toBeVisible();
  });
});

test.describe('Error handling - invalid race', () => {
  test('should show not found when race ID does not exist', async ({ page }) => {
    await authenticateUser(page);

    await page.route('**/api/auth/user', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testUser) })
    );
    await page.route('**/api/auth/status', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
    );
    // Race not found
    await page.route('**/api/races/nonexistent-race', route =>
      route.fulfill({ status: 404, body: '' })
    );
    await page.route('**/api/drivers/active/nonexistent-race', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );

    await page.goto('/races/nonexistent-race/predict');
    await page.waitForLoadState('networkidle');

    // Should show "not found" or error state, not the prediction form
    const submitButton = page.getByRole('button', { name: /submit prediction|indienen/i });
    await expect(submitButton).not.toBeVisible();
  });
});

test.describe('Error handling - empty prediction', () => {
  test('should allow submitting with empty fields (partial prediction)', async ({ page }) => {
    await authenticateUser(page);

    let savedPrediction: Record<string, string> | null = null;
    await setupApiMocks(page);

    // Override save route to capture the posted data
    await page.route(`**/api/predictions/${futureRace.id}`, route => {
      if (route.request().method() === 'POST') {
        savedPrediction = JSON.parse(route.request().postData() || '{}');
        route.fulfill({ status: 200, contentType: 'application/json', body: route.request().postData() || '{}' });
      } else {
        route.continue();
      }
    });

    await page.goto(`/races/${futureRace.id}/predict`);
    await page.waitForLoadState('networkidle');

    // Only select first place, leave the rest empty
    await selectDriver(page, 'first-place', 'Max Verstappen');

    const submitButton = page.getByRole('button', { name: /submit|indienen/i });
    await submitButton.click();

    // Prediction should be submitted with empty strings for unselected fields
    await expect(() => {
      expect(savedPrediction).not.toBeNull();
      expect(savedPrediction!.firstPlaceDriverId).toBe('verstappen');
      expect(savedPrediction!.secondPlaceDriverId).toBe('');
      expect(savedPrediction!.thirdPlaceDriverId).toBe('');
    }).toPass({ timeout: 5000 });
  });
});
