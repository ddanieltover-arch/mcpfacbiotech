import { expect, test } from '@playwright/test';
import {
  activeTransform,
  buttonClassName,
  isScaledDown,
  seedCartBadge,
} from './helpers/motion';

test.describe('UX-MOTION-4 — motion QA', () => {
  test('checkout ops surface exposes data-motion=reduce', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('[data-motion="reduce"]')).toBeVisible();
  });

  test('checkout buttons do not press-scale inside reduce zone', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('[data-motion="reduce"]')).toBeVisible();

    const placeOrder = page.getByRole('button', { name: /place order/i });
    await expect(placeOrder).toBeVisible();

    const className = await buttonClassName(placeOrder);
    expect(className).toContain('in-data-[motion=reduce]:active:scale-100');

    const transform = await activeTransform(page, placeOrder);
    expect(isScaledDown(transform)).toBe(false);
  });

  test('marketing contact button includes press-scale utility', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/contact');
    await expect(page.locator('[data-motion="reduce"]')).toHaveCount(0);

    const submit = page.getByRole('button', { name: /send message/i });
    await expect(submit).toBeVisible();

    const className = await buttonClassName(submit);
    expect(className).toContain('motion-safe:active:scale-[0.98]');
  });

  test('prefers-reduced-motion disables marketing press-scale', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact');

    const submit = page.getByRole('button', { name: /send message/i });
    const transform = await activeTransform(page, submit);
    expect(isScaledDown(transform)).toBe(false);
  });

  test('prefers-reduced-motion keeps marketing routes readable on entry', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main [style*="opacity: 0"]')).toHaveCount(0);
  });

  test('marketing nav shows cart badge after cart seed', async ({ page }) => {
    await seedCartBadge(page);
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /shopping cart with 1 items/i }).first(),
    ).toBeVisible();
  });

  test('cart badge still renders under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seedCartBadge(page);
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /shopping cart with 1 items/i }).first(),
    ).toBeVisible();
  });
});
