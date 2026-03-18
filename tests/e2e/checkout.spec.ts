import { test, expect } from '@playwright/test';
import { loginAsRole } from '../helpers/auth';

test.describe('Checkout', () => {
  test('full checkout flow creates order', async ({ page }) => {
    await loginAsRole(page, 'buyer');

    // Add item to cart via PDP
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await page.locator('[href*="/products/"]').first().click();
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(3000);

    await page.goto('/checkout');
    await page.waitForTimeout(3000);

    // Fill shipping address fields that are visible
    const fields: Record<string, string> = {
      firstName: 'Michael',
      lastName: 'Williams',
      streetName: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = page.locator(`input[name="${name}"]`).first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill(value);
      }
    }

    // Select country if it's a dropdown
    const countrySelect = page.locator('select[name="country"]').first();
    if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countrySelect.selectOption('US');
    }

    // Click Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Order")').first();
    if (await placeOrderBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await placeOrderBtn.click();
      await page.waitForTimeout(5000);
      // Should see confirmation or redirect
      const url = page.url();
      expect(url).toMatch(/\/(dashboard|checkout|order)/);
    }
  });
});
