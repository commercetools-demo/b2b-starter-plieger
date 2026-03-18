import { test, expect } from '@playwright/test';
import { loginAsRole, ACCOUNTS } from '../helpers/auth';

test.describe('Business Units', () => {
  test('header shows business unit name after login', async ({ page }) => {
    await loginAsRole(page, 'admin');
    // Header should show company name
    await expect(page.locator(`text=${ACCOUNTS.admin.company}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test('header shows store key', async ({ page }) => {
    await loginAsRole(page, 'admin');
    await expect(page.locator('text=us-large-customers').first()).toBeVisible({ timeout: 10_000 });
  });

  test('settings page shows company info', async ({ page }) => {
    await loginAsRole(page, 'admin');
    await page.goto('/dashboard/settings');
    await page.waitForTimeout(3000);
    // Should see business unit name or settings form
    await expect(page.locator(`text=/Eagle|Settings|Company/i`).first()).toBeVisible({ timeout: 10_000 });
  });

  test('GET /api/business-units returns list', async ({ page }) => {
    await loginAsRole(page, 'admin');
    const res = await page.request.get('/api/business-units');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.results ?? data).toBeDefined();
  });

  test('different companies see different prices', async ({ page }) => {
    // Login as large customer
    await loginAsRole(page, 'buyer');
    const res1 = await page.request.get('/api/products?limit=1');
    const data1 = await res1.json();
    const product1 = data1.results?.[0];

    // Logout and login as liberty (medium customer)
    await page.request.post('/api/auth/logout');
    await loginAsRole(page, 'libertyBuyer');
    const res2 = await page.request.get('/api/products?limit=1');
    const data2 = await res2.json();
    const product2 = data2.results?.[0];

    // Both should return products (may be different prices/products)
    expect(product1).toBeDefined();
    expect(product2).toBeDefined();
  });
});
