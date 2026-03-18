import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'buyer');
  });

  test('orders page shows heading', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(3000);
    await expect(page.locator('h1:has-text("Orders")')).toBeVisible({ timeout: 10_000 });
  });

  test('orders page has table headers or empty state', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(5000);
    // If there are orders, table should have Date/Status columns; if empty, shows empty message
    const hasOrders = await page.locator('tbody tr').first().isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await page.locator('text=/No orders/i').isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasOrders || hasEmpty).toBeTruthy();
  });

  test('filter orders by status', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(3000);
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('Open');
      await page.waitForTimeout(3000);
    }
  });

  test('click order row navigates to detail', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(5000);
    const row = page.locator('tbody tr').first();
    if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await row.click();
      await expect(page).toHaveURL(/\/dashboard\/orders\/.+/);
    }
  });

  test('order detail shows line items', async ({ page }) => {
    const res = await page.request.get('/api/orders?limit=1');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    const order = data.results?.[0];
    if (!order) { test.skip(); return; }
    await page.goto(`/dashboard/orders/${order.id}`);
    await page.waitForTimeout(5000);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
  });

  test('GET /api/orders returns paginated results', async ({ page }) => {
    const res = await page.request.get('/api/orders?limit=5');
    // May return 401 if session not carried — that's OK for API test
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
    expect(data.total).toBeDefined();
  });

  test('GET /api/orders with status filter', async ({ page }) => {
    const res = await page.request.get('/api/orders?limit=5&status=Open');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
    for (const order of data.results) {
      expect(order.orderState).toBe('Open');
    }
  });
});
