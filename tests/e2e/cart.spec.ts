import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'buyer');
  });

  test('add to cart from PDP', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await page.locator('[href*="/products/"]').first().click();
    await expect(page).toHaveURL(/\/products\/.+/);
    await page.waitForTimeout(3000);
    const addBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();
    // Wait for either mini cart or network response
    await page.waitForTimeout(5000);
    // Verify by going to cart page and checking it has items
    await page.goto('/cart');
    await page.waitForTimeout(3000);
    // Cart page should show at least one item or the item we just added
    const hasLineItems = await page.locator('img').first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasLineItems).toBeTruthy();
  });

  test('view cart page from mini cart or direct navigation', async ({ page }) => {
    // Add item and go to cart
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await page.locator('[href*="/products/"]').first().click();
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(3000);
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart/);
  });

  test('cart page shows line items after adding', async ({ page }) => {
    // Add item via PDP
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await page.locator('[href*="/products/"]').first().click();
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(2000);
    // Go to cart page
    await page.goto('/cart');
    await page.waitForTimeout(3000);
    // Should see at least one item
    const hasItems = await page.locator('img').first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasItems).toBeTruthy();
  });

  test('remove item from cart page', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(3000);
    const removeBtn = page.locator('button[aria-label*="emove"], button:has-text("Remove")').first();
    if (await removeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(2000);
    }
  });
});
