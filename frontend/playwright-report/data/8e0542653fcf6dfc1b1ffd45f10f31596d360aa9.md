# Test info

- Name: Leaderboard Page >> should display empty state for race with no predictions
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:173:3

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for getByRole('button', { name: 'Race Results' })

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:188:60
```

# Test source

```ts
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
  147 |
  148 |   test('should show selected race with red background', async ({ page }) => {
  149 |   // Use test login for authenticated access
  150 |   await page.addInitScript(() => {
  151 |     window.localStorage.setItem('auth', JSON.stringify({
  152 |       user: {
  153 |         id: 1,
  154 |         name: 'Test User',
  155 |         email: 'test@example.com'
  156 |       }
  157 |     }));
  158 |   });
  159 |
  160 |   await page.goto('/leaderboard');
  161 |   
  162 |   // Switch to race results view
  163 |   await page.getByRole('button', { name: 'Race Results' }).click();
  164 |   
  165 |   // Click on a race
  166 |   await page.getByText('Belgian Grand Prix').click();
  167 |   
  168 |   // Should have red background for selected race
  169 |   const selectedRace = page.locator('button').filter({ hasText: 'Belgian Grand Prix' });
  170 |   await expect(selectedRace).toHaveClass(/bg-f1-red/);
  171 | });
  172 |
  173 |   test('should display empty state for race with no predictions', async ({ page }) => {
  174 |   // Use test login for authenticated access
  175 |   await page.addInitScript(() => {
  176 |     window.localStorage.setItem('auth', JSON.stringify({
  177 |       user: {
  178 |         id: 1,
  179 |         name: 'Test User',
  180 |         email: 'test@example.com'
  181 |       }
  182 |     }));
  183 |   });
  184 |
  185 |   await page.goto('/leaderboard');
  186 |   
  187 |   // Switch to race results view
> 188 |   await page.getByRole('button', { name: 'Race Results' }).click();
      |                                                            ^ Error: locator.click: Test ended.
  189 |   
  190 |   // Mock empty race results
  191 |   await page.route('**/api/predictions/race/*/results', async route => {
  192 |     await route.fulfill({
  193 |       status: 200,
  194 |       contentType: 'application/json',
  195 |       body: JSON.stringify([])
  196 |     });
  197 |   });
  198 |   
  199 |   // Click on a race
  200 |   await page.getByText('Belgian Grand Prix').click();
  201 |   
  202 |   // Should show empty state message
  203 |   await expect(page.getByText('No further predictions made for this race.')).toBeVisible();
  204 | });
  205 |
  206 |   test('should display empty state for season with no results', async ({ page }) => {
  207 |   // Use test login for authenticated access
  208 |   await page.addInitScript(() => {
  209 |     window.localStorage.setItem('auth', JSON.stringify({
  210 |       user: {
  211 |         id: 1,
  212 |         name: 'Test User',
  213 |         email: 'test@example.com'
  214 |       }
  215 |     }));
  216 |   });
  217 |
  218 |   await page.goto('/leaderboard');
  219 |   
  220 |   // Mock empty season leaderboard
  221 |   await page.route('**/api/predictions/leaderboard', async route => {
  222 |     await route.fulfill({
  223 |       status: 200,
  224 |       contentType: 'application/json',
  225 |       body: JSON.stringify([])
  226 |     });
  227 |   });
  228 |   
  229 |   // Should show empty state message
  230 |   await expect(page.getByText('No results available for this season yet.')).toBeVisible();
  231 | });
  232 |
  233 |   test('should handle loading states', async ({ page }) => {
  234 |   // Use test login for authenticated access
  235 |   await page.addInitScript(() => {
  236 |     window.localStorage.setItem('auth', JSON.stringify({
  237 |       user: {
  238 |         id: 1,
  239 |         name: 'Test User',
  240 |         email: 'test@example.com'
  241 |       }
  242 |     }));
  243 |   });
  244 |
  245 |   // Mock slow API response
  246 |   await page.route('**/api/predictions/leaderboard', async route => {
  247 |     await new Promise(resolve => setTimeout(resolve, 1000));
  248 |     await route.fulfill({
  249 |       status: 200,
  250 |       contentType: 'application/json',
  251 |       body: JSON.stringify([])
  252 |     });
  253 |   });
  254 |
  255 |   await page.goto('/leaderboard');
  256 |   
  257 |   // Should show loading spinner
  258 |   await expect(page.locator('.animate-spin')).toBeVisible();
  259 | });
  260 |
  261 |   test('should handle authentication loading state', async ({ page }) => {
  262 |     // Mock slow auth check
  263 |     await page.addInitScript(() => {
  264 |       // Simulate slow auth loading
  265 |       const originalFetch = window.fetch;
  266 |       window.fetch = async (...args) => {
  267 |         if (args[0].includes('/auth/user')) {
  268 |           await new Promise(resolve => setTimeout(resolve, 1000));
  269 |         }
  270 |         return originalFetch(...args);
  271 |       };
  272 |     });
  273 |
  274 |     await page.goto('/leaderboard');
  275 |     
  276 |     // Should show loading spinner during auth check
  277 |     await expect(page.locator('.animate-spin')).toBeVisible();
  278 |   });
  279 | }); 
```