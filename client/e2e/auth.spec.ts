import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page and form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('prevents submission with empty form', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form').getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });
});
