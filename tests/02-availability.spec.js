const { test, expect } = require('@playwright/test');

// MISSION 2 — Add a Playwright test that first FAILS because of BUG-101.
// Behavior required: enabling "Available bikes only" hides Riverside Park (0 bikes)
// and shows exactly three station cards. Fix public/app.js only AFTER the test fails.

test('BUG-101: available-only filter excludes zero-bike stations', async ({ page }) => {
  // TODO: replace test.skip with test and implement reliable locators and assertions.
  await page.goto('/');

  const cards = page.getByTestId('station-card');

  // Web-first assertion: auto-waits until the stations have loaded.
  await expect(cards).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Riverside Park' })).toBeVisible();

  // Check the filter using its accessible name.
  await page.getByRole('checkbox', { name: 'Available bikes only' }).check();

  await expect(cards).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Riverside Park' })).toHaveCount(0);
});
