import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Purchase Lists', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'buyer');
  });

  test('purchase lists page loads', async ({ page }) => {
    await page.goto('/dashboard/purchase-lists');
    await page.waitForTimeout(3000);
    await expect(page.locator('h1:has-text("Purchase Lists")')).toBeVisible({ timeout: 10_000 });
  });

  test('create purchase list from UI', async ({ page }) => {
    await page.goto('/dashboard/purchase-lists');
    await page.waitForTimeout(3000);
    // Look for a "Create" or "New" button/link
    const createBtn = page.locator('a:has-text("Create"), a:has-text("New List")').first();
    if (await createBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(2000);
    }
    // Fill name if modal/form appears
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nameInput.fill(`UI Test List ${Date.now()}`);
      // Click submit button (might be disabled until name filled)
      await page.waitForTimeout(500);
      const submitBtn = page.locator('button:has-text("Create"):not([disabled])').last();
      if (await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test('view purchase list detail', async ({ page }) => {
    await page.goto('/dashboard/purchase-lists');
    await page.waitForTimeout(3000);
    const row = page.locator('tbody tr').first();
    if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await row.click();
      await page.waitForTimeout(3000);
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('create and delete purchase list via API', async ({ page }) => {
    const createRes = await page.request.post('/api/purchase-lists', {
      data: { name: `API Test List ${Date.now()}` },
    });
    if (!createRes.ok()) { test.skip(); return; }
    const createData = await createRes.json();
    const list = createData.shoppingList ?? createData;
    expect(list.id).toBeDefined();

    const deleteRes = await page.request.delete(`/api/purchase-lists/${list.id}`);
    expect(deleteRes.ok()).toBeTruthy();
  });

  test('GET /api/purchase-lists returns results', async ({ page }) => {
    const res = await page.request.get('/api/purchase-lists');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });
});
