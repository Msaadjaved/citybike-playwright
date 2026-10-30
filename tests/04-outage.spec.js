const { test, expect } = require('@playwright/test');

// MISSION 4 — Mock the first /api/stations GET as 503, confirm the error banner,
// then let Retry loading reach the real server and recover to 4 stations.

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let attempts = 0;

  // Register the route BEFORE goto: the app requests stations as soon as the page loads.
  await page.route('**/api/stations', async route => {
    attempts++;
    if (attempts === 1) {
      // First attempt: simulate an outage.
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    } else {
      // Later attempts: let the request reach the real server.
      await route.continue();
    }
  });

  await page.goto('/');

  // Outage: error banner visible, no station cards.
  const alert = page.getByRole('alert').filter({ hasText: 'Unable to load stations.' });
  await expect(alert).toBeVisible();
  await expect(page.getByTestId('station-card')).toHaveCount(0);

  // Recovery: retry reaches the real API and the list is restored.
  await page.getByRole('button', { name: 'Retry loading' }).click();
  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await expect(alert).toBeHidden();

  // The retry really made a second request.
  expect(attempts).toBe(2);
});