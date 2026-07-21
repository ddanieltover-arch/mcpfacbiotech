import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Minimal .env loader so LEGACY_* flags work without the dotenv package. */
export function loadEnvFiles(files = ['.env', '.env.local']): void {
  for (const file of files) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}
