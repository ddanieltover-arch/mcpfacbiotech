import { expect, test } from '@playwright/test';
import { backendBaseUrl, hasCommerceE2eEnv } from './helpers/commerce-env';

const guestEmail = () => `e2e.commerce.${Date.now()}@example.com`;

const shipping = {
  firstName: 'E2E',
  lastName: 'Buyer',
  addressLine1: '100 Research Park',
  city: 'Boston',
  postalCode: '02101',
  country: 'United States',
};

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
};

test.describe('Phase 19 — catalog → cart → checkout', () => {
  test.skip(
    !hasCommerceE2eEnv(),
    'Requires .env with DATABASE_URL and backend URL (pnpm dev with API + DB)',
  );

  test('guest browses catalog, adds to cart, and places order', async ({ page, request }) => {
    const productsResponse = await request.get(
      `${backendBaseUrl()}/api/v1/products?limit=20&sort=featured`,
    );
    expect(productsResponse.ok()).toBeTruthy();
    const catalog = (await productsResponse.json()) as {
      data?: { items?: CatalogProduct[] };
    };
    const pricedProduct = catalog.data?.items?.find((item) => item.price != null);
    test.skip(!pricedProduct, 'No priced products in catalog — seed or import catalog first');

    // ── Catalog browse ──────────────────────────────────────────────────────
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await page.getByRole('link', { name: pricedProduct!.name }).first().click();
    await expect(page).toHaveURL(new RegExp(`/products/${pricedProduct!.slug}`));

    // ── Add to cart (PDP) ─────────────────────────────────────────────────
    const addButton = page.locator('main').getByRole('button', { name: 'Add to Cart' }).first();
    await expect(addButton).toBeVisible({ timeout: 20_000 });

    const addResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/cart/items') && response.request().method() === 'POST',
    );
    await addButton.click();
    const addResponse = await addResponsePromise;
    expect(addResponse.status()).toBe(201);

    const cartDrawer = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(cartDrawer).toContainText(pricedProduct!.name, {
      timeout: 15_000,
    });
    await cartDrawer.getByLabel('Close cart').click();

    // ── Cart ────────────────────────────────────────────────────────────────
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    await expect(page.getByText(pricedProduct!.name)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Checkout' }).click();
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

    // ── Guest checkout ──────────────────────────────────────────────────────
    await page.locator('#email').fill(guestEmail());
    await page.locator('#firstName').fill(shipping.firstName);
    await page.locator('#lastName').fill(shipping.lastName);
    await page.locator('#addressLine1').fill(shipping.addressLine1);
    await page.locator('#city').fill(shipping.city);
    await page.locator('#postalCode').fill(shipping.postalCode);
    await page.locator('#country').fill(shipping.country);

    const orderResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/orders/checkout') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Place Order' }).click();
    const orderResponse = await orderResponsePromise;
    expect(orderResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 45_000 });
    await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
    await expect(page.getByText(/Reference:/)).toBeVisible();
  });
});
