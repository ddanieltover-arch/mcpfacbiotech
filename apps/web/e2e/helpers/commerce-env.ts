import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../../../..');

export function hasCommerceE2eEnv(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
      (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL) &&
      existsSync(resolve(repoRoot, '.env')),
  );
}

export function backendBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.BACKEND_URL ??
    'http://localhost:3001'
  );
}
