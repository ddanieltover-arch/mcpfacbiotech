import type { Locator, Page } from '@playwright/test';

/** Read computed transform while the element is in :active (pointer held down). */
export async function activeTransform(page: Page, locator: Locator): Promise<string> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element has no bounding box');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  const transform = await locator.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.up();
  return transform;
}

export async function buttonClassName(locator: Locator): Promise<string> {
  return (await locator.getAttribute('class')) ?? '';
}

/** True when transform matrix scale is below 0.99 (press-scale engaged). */
export function isScaledDown(transform: string): boolean {
  if (!transform || transform === 'none') return false;
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return false;
  const scaleX = parseFloat(match[1].split(',')[0]?.trim() ?? '1');
  return scaleX < 0.99;
}

/** Seed a single cart line so header CountBadge renders without API. */
export async function seedCartBadge(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      'mcpfac-cart',
      JSON.stringify({
        state: {
          items: [
            {
              productId: 'motion-qa-product',
              productName: 'Motion QA Product',
              productSku: 'MQA-001',
              unitPrice: 10,
              quantity: 1,
            },
          ],
          cartId: '',
          currency: 'USD',
        },
        version: 0,
      }),
    );
  });
}
