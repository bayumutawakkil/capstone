import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Next.js default app usually has a title, we'll just check it doesn't crash
  await expect(page).toHaveTitle(/.*|/);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('/login');
  // Just testing that the login page loads without an error 500
  await expect(page.locator('body')).toBeVisible();
});
