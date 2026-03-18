import { type Page, expect } from '@playwright/test';

/** Demo accounts */
export const ACCOUNTS = {
  admin: { email: 'james-smith@ehlt.com', password: '123', company: 'Eagle Heavy Lift' },
  approver: { email: 'emma-johnson@ehlt.com', password: '123', company: 'Eagle Heavy Lift' },
  buyer: { email: 'michael-williams@ehlt.com', password: '123', company: 'Eagle Heavy Lift' },
  libertyAdmin: { email: 'olivia-newton@lcs.com', password: '123', company: 'Liberty Crane' },
  libertyBuyer: { email: 'ava-brown@lcs.com', password: '123', company: 'Liberty Crane' },
  euAdmin: { email: 'oliver-smith@ltsl.com', password: '123', company: 'LiftTech Solutions' },
} as const;

/**
 * Log in via the login page form. Waits for redirect to /dashboard.
 */
export async function loginAs(
  page: Page,
  email: string,
  password = '123',
) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

/**
 * Log in as a named demo account role.
 */
export async function loginAsRole(page: Page, role: keyof typeof ACCOUNTS) {
  const acct = ACCOUNTS[role];
  await loginAs(page, acct.email, acct.password);
}

/**
 * Log out by clicking the logout button or calling the API directly.
 */
export async function logout(page: Page) {
  await page.request.post('/api/auth/logout');
  await page.goto('/');
}

/**
 * Add an item to cart via API (faster than browser clicks for setup).
 */
export async function addItemToCartViaAPI(page: Page) {
  // Search for a product to get a productId
  const searchRes = await page.request.get('/api/products?limit=1');
  const searchData = await searchRes.json();
  const product = searchData.results?.[0];
  if (!product) throw new Error('No products found');

  const productId = product.id;
  const variantId = product.masterVariant?.id ?? 1;

  const res = await page.request.post('/api/cart/items', {
    data: { productId, variantId, quantity: 1 },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}
