#!/usr/bin/env node
/**
 * Vercel web build: generate Prisma, build shared packages + Nest API,
 * copy Nest dist into apps/web/vendor for serverless tracing, then build Next.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// vercel.json runs: `cd ../.. && node apps/web/scripts/vercel-build.js` (cwd = monorepo root)
const root = process.cwd();

function run(command) {
  console.log(`\n> ${command}\n`);
  execSync(command, { cwd: root, stdio: 'inherit', env: process.env });
}

run('pnpm db:generate');
run('pnpm --filter @mcpfac/shared-types build');
run('pnpm --filter @mcpfac/shared-utils build');
run('pnpm --filter @mcpfac/shared-validators build');
run('pnpm --filter @mcpfac/api build');

const src = path.join(root, 'apps', 'api', 'dist');
const dest = path.join(root, 'apps', 'web', 'vendor', 'nest-api');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied Nest dist -> ${dest}`);

run('pnpm --filter @mcpfac/web build');
