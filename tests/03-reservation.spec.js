const { test, expect } = require('@playwright/test');

// MISSION 3 — Reservation API contract.
// (a) invalid email gives a visible error without a POST to /api/reservations
// (b) a successful reservation: mock the POST, assert the JSON payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  // Record any request that reaches /api/reservations; for an invalid email there must be none.
  const posts = [];
  await page.route('**/api/reservations', async route => {
    posts.push(route.request());
    await route.continue();
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill('not-an-email');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  // The validation error is shown...
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  // ...no success message appears...
  await expect(page.getByRole('status')).not.toContainText('Reservation confirmed');
  // ...and the backend was never called.
  expect(posts).toHaveLength(0);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  let payload;
  await page.route('**/api/reservations', async route => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    payload = request.postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reservationId: 'CB-DEMO-777', stationId: payload.stationId })
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await expect(page.getByText('Selected station: Central Square')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email address' }).fill('student@example.com');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  // The UI shows the mocked reservation ID (web-first assertion waits for it).
  await expect(page.getByRole('status')).toContainText('CB-DEMO-777');

  // The request payload matches the contract.
  expect(payload).toEqual({ stationId: 'central', email: 'student@example.com' });
});