# Test info

- Name: Leaderboard Page >> should handle loading states
- Location: /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:233:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.animate-spin')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.animate-spin')

    at /Users/rickveenstra/workspace/cursor/formula1chatter/frontend/tests/leaderboard.spec.ts:258:47
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
  188 |   await page.getByRole('button', { name: 'Race Results' }).click();
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
> 258 |   await expect(page.locator('.animate-spin')).toBeVisible();
      |                                               ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
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