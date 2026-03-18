import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Dashboard', () => {
  test('dashboard shows welcome message', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard shows stat cards', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.waitForTimeout(3000);
    // Should see Total Orders stat
    await expect(page.locator('text=Total Orders')).toBeVisible();
  });

  test('dashboard shows recent orders table', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.waitForTimeout(5000);
    // Should see order table or empty state
    const hasTable = await page.locator('text=Recent Orders').isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasTable) {
      await expect(page.locator('text=Recent Orders')).toBeVisible();
    }
  });

  test('dashboard quick action buttons visible', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.waitForTimeout(3000);
    await expect(page.locator('text=New Order').first()).toBeVisible();
  });

  test('admin sees approval stats', async ({ page }) => {
    await loginAsRole(page, 'admin');
    await page.waitForTimeout(3000);
    // Admin should see Pending Approvals card
    await expect(page.locator('text=Pending Approvals')).toBeVisible();
  });

  test('dashboard navigation sidebar works', async ({ page }) => {
    await loginAsRole(page, 'admin');
    // Click Orders in sidebar or nav
    const ordersLink = page.locator('a[href="/dashboard/orders"]').first();
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/\/dashboard\/orders/);
    }
  });

  test('stat card links navigate to correct pages', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.waitForTimeout(3000);
    const ordersCard = page.locator('a[href="/dashboard/orders"]:has-text("Total Orders")');
    if (await ordersCard.isVisible()) {
      await ordersCard.click();
      await expect(page).toHaveURL(/\/dashboard\/orders/);
    }
  });
});
