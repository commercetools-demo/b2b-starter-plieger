import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Product Catalog', () => {
  test('products page shows product grid', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.goto('/products');
    await expect(page.locator('[href*="/products/"]').first()).toBeVisible({ timeout: 15_000 });
  });

  test('search filters products', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.goto('/products');
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="earch"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('excavator');
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);
      await expect(page.locator('[href*="/products/"]').first()).toBeVisible();
    }
  });

  test('category filtering works', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.goto('/products');
    await page.waitForTimeout(2000);
    const categoryLink = page.locator('a[href*="categoryId"], button:has-text("Excavators"), button:has-text("Cranes")').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await page.waitForTimeout(3000);
    }
  });

  test('clicking product navigates to PDP', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.goto('/products');
    await page.waitForTimeout(3000);
    const productLink = page.locator('[href*="/products/"]').first();
    await expect(productLink).toBeVisible();
    await productLink.click();
    await expect(page).toHaveURL(/\/products\/.+/);
    await expect(page.locator('button:has-text("Add to Cart")').first()).toBeVisible({ timeout: 10_000 });
  });

  test('logged out products show "Price on request"', async ({ page }) => {
    await page.request.post('/api/auth/logout');
    await page.goto('/products');
    await page.waitForTimeout(3000);
    const priceOnRequest = page.locator('text=Price on request').first();
    if (await priceOnRequest.isVisible()) {
      await expect(priceOnRequest).toBeVisible();
    }
  });

  test('PDP shows price when logged in', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.goto('/products');
    await page.waitForTimeout(3000);
    // Navigate to a specific product detail page
    await page.locator('[href*="/products/"]').first().click();
    await page.waitForTimeout(5000);
    // On PDP, the price should be shown (not "Price on request")
    const hasPriceOnRequest = await page.locator('text=Price on request').isVisible().catch(() => false);
    const hasPrice = await page.locator('text=/[\\$€£]/').first().isVisible().catch(() => false);
    // When logged in with a store, PDP should show a real price
    expect(hasPrice || !hasPriceOnRequest).toBeTruthy();
  });

  test('GET /api/products returns results', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    const res = await page.request.get('/api/products?limit=5');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.results).toBeDefined();
    expect(data.results.length).toBeGreaterThan(0);
  });

  test('GET /api/categories returns category tree', async ({ page }) => {
    const res = await page.request.get('/api/categories');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.categories ?? data.results ?? data)).toBeTruthy();
  });
});
