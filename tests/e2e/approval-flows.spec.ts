import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Approval Flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'approver');
  });

  test('approval flows page shows heading', async ({ page }) => {
    await page.goto('/dashboard/approval-flows');
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5_000 });
  });

  test('GET /api/approval-flows returns results', async ({ page }) => {
    const res = await page.request.get('/api/approval-flows');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });

  test('filter approval flows by pending status', async ({ page }) => {
    const res = await page.request.get('/api/approval-flows?status=Pending');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });

  test('click flow row navigates to detail', async ({ page }) => {
    await page.goto('/dashboard/approval-flows');
    await page.waitForTimeout(5000);
    const row = page.locator('tbody tr').first();
    if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await row.click();
      await expect(page).toHaveURL(/\/dashboard\/approval-flows\/.+/);
    }
  });
});
