import { expect, test } from '@playwright/test';
import {
  createConfirmedUser,
  createPendingGuestOrder,
  createSupabaseAdmin,
  deleteUserByEmail,
  disconnectPrisma,
  hasAdminE2eEnv,
  provisionAdminUser,
} from './helpers/admin-setup';

const password = 'E2eAdminPass123!';
const firstName = 'E2E';
const lastName = 'Admin';

test.describe('Admin E2E — login → order → status', () => {
  test.skip(
    !hasAdminE2eEnv(),
    'Requires .env with Supabase keys, DATABASE_URL, and backend URL (pnpm dev)',
  );

  test('admin logs in, opens order, and confirms PENDING → CONFIRMED', async ({
    page,
  }) => {
    test.setTimeout(300_000);

    const adminClient = createSupabaseAdmin();
    const email = `e2e.admin+${Date.now()}@example.com`;

    try {
      await createConfirmedUser(adminClient, {
        email,
        password,
        firstName,
        lastName,
      });
      await provisionAdminUser({ email, password, firstName, lastName });

      const { orderId, orderNumber } = await createPendingGuestOrder();

      // ── Login ───────────────────────────────────────────────────────────
      await page.goto(`/login?redirect=${encodeURIComponent('/admin/orders')}`);
      await page.getByLabel('Email address').fill(email);
      await page.getByPlaceholder('Enter your password').fill(password);
      await page.getByRole('button', { name: /Sign In/i }).click();

      await expect(page).not.toHaveURL(/\/login/, { timeout: 45_000 });
      await page.goto('/admin/orders');
      await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(/ADMINISTRATOR/i).first()).toBeVisible();
      await expect(page.getByRole('link', { name: orderNumber })).toBeVisible({
        timeout: 20_000,
      });

      // ── Order detail (wait for API, not just navigation) ────────────────
      const detailResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/api/v1/admin/orders/${orderId}`) &&
          response.request().method() === 'GET',
        { timeout: 45_000 },
      );
      await page.goto(`/admin/orders/${orderId}`);
      const detailResponse = await detailResponsePromise;
      expect(
        detailResponse.ok(),
        `Order detail failed: ${detailResponse.status()} ${await detailResponse.text()}`,
      ).toBeTruthy();

      await expect(page.getByRole('heading', { name: orderNumber })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByRole('button', { name: 'Set CONFIRMED' })).toBeVisible();

      // ── Status transition ───────────────────────────────────────────────
      const statusResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/api/v1/admin/orders/${orderId}/status`) &&
          response.request().method() === 'PATCH',
        { timeout: 45_000 },
      );
      await page.getByRole('button', { name: 'Set CONFIRMED' }).click();
      const statusResponse = await statusResponsePromise;
      expect(
        statusResponse.ok(),
        `Status update failed: ${statusResponse.status()} ${await statusResponse.text()}`,
      ).toBeTruthy();

      await expect(page.getByRole('button', { name: 'Set PROCESSING' })).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByRole('button', { name: 'Set CONFIRMED' })).toHaveCount(0);
    } finally {
      await deleteUserByEmail(adminClient, email);
      await disconnectPrisma();
    }
  });
});
