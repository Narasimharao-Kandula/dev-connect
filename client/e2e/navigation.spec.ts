import { test, expect } from '@playwright/test';

test.describe('Public navigation', () => {
  test('landing page loads with key content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('heading', { name: /devconnect|developer|collaborat/i }).first()).toBeVisible();
  });

  test('features page is accessible', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByRole('heading', { name: /everything you need/i })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });
});
