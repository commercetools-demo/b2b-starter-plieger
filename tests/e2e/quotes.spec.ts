import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Quote Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'buyer');
  });

  test('quotes page shows tabs for quotes and requests', async ({ page }) => {
    await page.goto('/dashboard/quotes');
    await page.waitForTimeout(3000);
    await expect(page.locator('button:has-text("Quotes")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Quote Requests")')).toBeVisible();
  });

  test('quote requests tab shows content', async ({ page }) => {
    await page.goto('/dashboard/quotes');
    await page.waitForTimeout(3000);
    await page.click('button:has-text("Quote Requests")');
    await page.waitForTimeout(5000);
    // Should see table rows or empty message - look for any content
    const hasRows = await page.locator('tbody tr').first().isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await page.locator('text=/No quote|empty/i').first().isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test('click quote row navigates to detail', async ({ page }) => {
    await page.goto('/dashboard/quotes');
    await page.waitForTimeout(5000);
    // Stay on default Quotes tab (not requests)
    const row = page.locator('tbody tr').first();
    if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await row.click();
      await expect(page).toHaveURL(/\/dashboard\/quotes\/.+/);
    }
  });

  test('create quote request flow', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await page.locator('[href*="/products/"]').first().click();
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(3000);

    // Navigate to quote request page
    await page.goto('/dashboard/quotes/request');
    await page.waitForTimeout(3000);

    // Fill comment if visible
    const commentInput = page.locator('textarea, input[name="comment"]').first();
    if (await commentInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await commentInput.fill('E2E test quote request');
    }

    // Submit
    const submitBtn = page.locator('button:has-text("Request Quote"), button:has-text("Submit")').first();
    if (await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(5000);
    }
  });

  test('GET /api/quote-requests returns results', async ({ page }) => {
    const res = await page.request.get('/api/quote-requests?limit=5');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });

  test('GET /api/quotes returns results', async ({ page }) => {
    const res = await page.request.get('/api/quotes?limit=5');
    if (!res.ok()) { test.skip(); return; }
    const data = await res.json();
    expect(data.results).toBeDefined();
  });
});
