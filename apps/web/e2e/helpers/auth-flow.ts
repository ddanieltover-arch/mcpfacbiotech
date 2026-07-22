import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createMagicLink } from './supabase-admin';

/** Force redirect_to on Supabase verify links (must be allow-listed in Supabase dashboard). */
export function withRedirectTo(actionLink: string, redirectTo: string): string {
  const url = new URL(actionLink);
  url.searchParams.set('redirect_to', redirectTo);
  return url.toString();
}

async function adoptImplicitSession(page: Page, appBase: string, sourceUrl: string): Promise<void> {
  const hash = new URL(sourceUrl).hash;
  if (!hash.includes('access_token=')) {
    throw new Error('Magic link returned hash without session tokens');
  }

  // createBrowserClient picks up implicit-flow hash tokens on load.
  await page.goto(`${appBase}/login${hash}`);
  await page.waitForFunction(() => {
    const keys = Object.keys(localStorage);
    return keys.some((key) => key.includes('auth-token') && localStorage.getItem(key));
  }, { timeout: 15_000 });
}

/**
 * Confirms email via magic link. Prefers `/auth/callback` (PKCE code).
 * Falls back to implicit hash tokens when Supabase redirects to the project Site URL.
 */
export async function verifyViaMagicLink(
  page: Page,
  admin: SupabaseClient,
  email: string,
  appBase: string,
): Promise<void> {
  const redirectTo = `${appBase}/auth/callback?next=/account`;
  const magicLink = withRedirectTo(await createMagicLink(admin, email, redirectTo), redirectTo);

  await page.goto(magicLink);
  await page.waitForURL(
    (url) => url.pathname.includes('/auth/callback') || url.hash.includes('access_token='),
    { timeout: 30_000 },
  );

  const current = page.url();

  if (current.includes('/auth/callback')) {
    await expect(page).toHaveURL(/\/account/, { timeout: 20_000 });
    return;
  }

  if (current.includes('access_token=')) {
    await adoptImplicitSession(page, appBase, current);
    await page.goto('/account');
    return;
  }

  throw new Error(`Unexpected post-verify URL: ${current}`);
}
