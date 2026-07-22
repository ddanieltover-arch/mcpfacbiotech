import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFiles } from '../../prisma/migrate-legacy/load-env';

const repoRoot = resolve(__dirname, '../..');
process.chdir(repoRoot);
loadEnvFiles();

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'pnpm dev',
        cwd: repoRoot,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});

export function hasAuthE2eEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  return Boolean(
    url &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      existsSync(resolve(repoRoot, '.env')),
  );
}
