import { expect, test } from '@playwright/test';
import { hasAuthE2eEnv } from '../playwright.config';
import {
  confirmUserEmail,
  createSupabaseAdmin,
  createUnconfirmedUser,
  deleteUserByEmail,
  findUserIdByEmail,
} from './helpers/supabase-admin';
import { verifyViaMagicLink } from './helpers/auth-flow';

const testPassword = 'E2eTestPass123!';
const firstName = 'E2E';
const lastName = 'Smoke';

test.describe('AUTH-9 — auth flow smoke', () => {
  test.skip(!hasAuthE2eEnv(), 'Requires .env with Supabase URL, anon key, and service role key');

  test('register → verify → login → logout', async ({ page, baseURL }) => {
    const admin = createSupabaseAdmin();
    const email = `e2e+${Date.now()}@example.com`;
    const appBase = baseURL ?? 'http://localhost:3000';
    const useCallbackVerify = process.env.E2E_AUTH_CALLBACK_VERIFY === '1';

    try {
      // ── Register ────────────────────────────────────────────────────────
      await page.goto('/register');
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Work email').fill(email);
      await page.getByLabel('Country').fill('United States');
      await page.getByLabel('Password', { exact: true }).fill(testPassword);
      await page.getByLabel('Confirm password').fill(testPassword);
      await page.getByRole('checkbox', { name: /I agree to the/i }).check();
      await page.getByRole('button', { name: /Create Account/i }).click();

      const successHeading = page.getByRole('heading', { name: 'Check your email' });
      const errorBanner = page.locator('.border-red-200');
      await expect(successHeading.or(errorBanner)).toBeVisible({ timeout: 30_000 });

      let userId: string | null = null;
      if (await successHeading.isVisible()) {
        userId = await findUserIdByEmail(admin, email);
      } else if (await errorBanner.isVisible()) {
        const message = await errorBanner.innerText();
        if (!/rate limit|invalid/i.test(message)) {
          throw new Error(`Registration failed: ${message}`);
        }
        userId = await createUnconfirmedUser(admin, {
          email,
          password: testPassword,
          firstName,
          lastName,
          country: 'United States',
        });
      }

      expect(userId).toBeTruthy();

      // ── Verify ──────────────────────────────────────────────────────────
      await confirmUserEmail(admin, userId!);

      if (useCallbackVerify) {
        await verifyViaMagicLink(page, admin, email, appBase);
        await assertAccountWelcome(page);
        await logoutFromHeader(page);
      }

      await page.goto('/account');
      await expect(page).toHaveURL(/\/login/);

      // ── Login ───────────────────────────────────────────────────────────
      await page.getByLabel('Email address').fill(email);
      await page.getByPlaceholder('Enter your password').fill(testPassword);
      await page.getByRole('button', { name: /Sign In/i }).click();

      await expect(page).not.toHaveURL(/\/login/, { timeout: 45_000 });
      await page.goto('/account');
      await assertAccountWelcome(page);

      // ── Logout ──────────────────────────────────────────────────────────
      await logoutFromHeader(page);
      await page.goto('/account');
      await expect(page).toHaveURL(/\/login/);
    } finally {
      await deleteUserByEmail(admin, email);
    }
  });
});

async function assertAccountWelcome(page: import('@playwright/test').Page) {
  await expect(
    page.getByRole('heading', { name: new RegExp(`Welcome, ${firstName}`) }),
  ).toBeVisible({ timeout: 20_000 });
}

async function logoutFromHeader(page: import('@playwright/test').Page) {
  await page.goto('/');
  const userMenu = page.getByRole('button', { name: 'User menu' });
  await expect(userMenu).toBeVisible({ timeout: 30_000 });
  await userMenu.hover();
  const signOut = page.getByRole('button', { name: 'Sign Out' });
  await expect(signOut).toBeVisible({ timeout: 5_000 });
  await signOut.click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible({ timeout: 20_000 });
}
