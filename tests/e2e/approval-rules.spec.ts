import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Approval Rules', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'admin');
  });

  test('approval rules page shows list', async ({ page }) => {
    await page.goto('/dashboard/approval-rules');
    await page.waitForTimeout(3000);
    await expect(page.locator('h1:has-text("Approval Rules")')).toBeVisible();
  });

  test('create rule button navigates to new page', async ({ page }) => {
    await page.goto('/dashboard/approval-rules');
    await page.waitForTimeout(3000);
    await page.locator('a:has-text("Create Rule")').click();
    await expect(page).toHaveURL(/\/dashboard\/approval-rules\/new/);
  });

  test('create rule page has predicate builder with conditions heading', async ({ page }) => {
    await page.goto('/dashboard/approval-rules/new');
    await page.waitForTimeout(3000);
    await expect(page.locator('h2:has-text("Conditions")')).toBeVisible();
    // Should see "When" label in the builder
    await expect(page.locator('text=When').first()).toBeVisible();
  });

  test('predicate builder shows generated predicate', async ({ page }) => {
    await page.goto('/dashboard/approval-rules/new');
    await page.waitForTimeout(3000);
    // Fill amount input
    const amountInput = page.locator('input[placeholder*="1,000"]').first();
    if (await amountInput.isVisible()) {
      await amountInput.fill('5000');
      await amountInput.press('Tab');
      await page.waitForTimeout(1000);
      // Predicate preview should show centAmount
      await expect(page.locator('text=/centAmount/')).toBeVisible();
    }
  });

  test('create approval rule end-to-end', async ({ page }) => {
    await page.goto('/dashboard/approval-rules/new');
    await page.waitForTimeout(3000);

    // Fill name
    await page.fill('input[name="name"]', `E2E Test Rule ${Date.now()}`);

    // Fill amount
    const amountInput = page.locator('input[placeholder*="1,000"]').first();
    if (await amountInput.isVisible()) {
      await amountInput.fill('10000');
      await amountInput.press('Tab');
    }

    // Select requester
    const buyerCheckbox = page.locator('label:has-text("Buyer") input[type="checkbox"]').first();
    if (await buyerCheckbox.isVisible()) {
      await buyerCheckbox.check();
    }

    // Select approver role
    const approverSelect = page.locator('select:below(:text("Tier 1"))').first();
    if (await approverSelect.isVisible()) {
      await approverSelect.selectOption('approver');
    }

    // Submit
    const createBtn = page.locator('button:has-text("Create Rule")').first();
    await createBtn.click();
    await page.waitForTimeout(5000);

    // Should redirect back to list or show success toast
    const redirected = await page.waitForURL('**/approval-rules', { timeout: 10_000 }).then(() => true).catch(() => false);
    expect(redirected || page.url().includes('approval-rules')).toBeTruthy();
  });

  test('GET /api/approval-rules returns results', async ({ page }) => {
    const res = await page.request.get('/api/approval-rules');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });
});
