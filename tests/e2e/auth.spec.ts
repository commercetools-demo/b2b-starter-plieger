import { test, expect } from '@playwright/test';
import { loginAs, loginAsRole, ACCOUNTS } from '../helpers/auth';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ACCOUNTS.buyer.email);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/login/);
    // Error message should appear somewhere on the login page
    await expect(page.locator('text=/invalid|incorrect|failed|error/i').first()).toBeVisible({ timeout: 10_000 });
  });

  test('login with missing fields shows validation', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Sign In")');
    // HTML5 validation or custom error — should still be on login
    await expect(page).toHaveURL(/\/login/);
  });

  test('GET /api/auth/me returns user after login', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    const res = await page.request.get('/api/auth/me');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.customer?.email ?? data.email).toBe(ACCOUNTS.buyer.email);
  });

  test('logout clears session', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.request.post('/api/auth/logout');
    const res = await page.request.get('/api/auth/me');
    const data = await res.json();
    expect(data.error || !data.email).toBeTruthy();
  });

  test('session persists across page reload', async ({ page }) => {
    await loginAsRole(page, 'buyer');
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('demo account quick-fill buttons work', async ({ page }) => {
    await page.goto('/login');
    // Click the first demo account button
    await page.click(`button:has-text("${ACCOUNTS.admin.email}")`);
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe(ACCOUNTS.admin.email);
  });
});
