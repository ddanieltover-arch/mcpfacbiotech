/**
 * Smoke-test admin API: ensure auth user + profile, promote ADMINISTRATOR,
 * obtain session token, exercise dashboard/products/quotes/orders/customers.
 *
 * PowerShell:
 *   $env:ADMIN_EMAIL="you@example.com"; pnpm db:smoke-admin
 */
import { createClient } from '@supabase/supabase-js';
import { PrismaClient, UserRole } from '@prisma/client';
import { loadEnvFiles } from './migrate-legacy/load-env';

loadEnvFiles();

function assertServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()) as {
      ref?: string;
      role?: string;
    };
    const projectRef = url.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (payload.ref !== projectRef || payload.role !== 'service_role') {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY looks invalid (JWT ref/role mismatch). ' +
          'Copy the service_role key from Supabase Dashboard → Project Settings → API.',
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('service_role')) throw error;
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT');
  }
}

assertServiceRoleKey();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const apiBase =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!email) throw new Error('Set ADMIN_EMAIL');
if (!supabaseUrl || !serviceKey || !anonKey) {
  throw new Error('Missing Supabase env (URL / SERVICE_ROLE_KEY / ANON_KEY)');
}

type Check = { name: string; pass: boolean; detail: string };

async function api(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${apiBase}/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function ensureAdminRole(prisma: PrismaClient, profileId: string) {
  const role = await prisma.role.findUnique({ where: { name: UserRole.ADMINISTRATOR } });
  if (!role) throw new Error('ADMINISTRATOR role missing — run pnpm db:seed');

  await prisma.userRoleAssignment.upsert({
    where: { profileId_roleId: { profileId, roleId: role.id } },
    create: { profileId, roleId: role.id },
    update: {},
  });
}

async function main() {
  const prisma = new PrismaClient();
  const checks: Check[] = [];

  try {
    const admin = createClient(supabaseUrl!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listed.error) throw listed.error;

    let authUser = listed.data.users.find((u) => u.email?.toLowerCase() === email);
    if (!authUser) {
      const created = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: `M6-Smoke-${Date.now()}!aA1`,
        user_metadata: { first_name: 'Admin', last_name: 'Smoke' },
      });
      if (created.error) throw created.error;
      authUser = created.data.user;
      checks.push({ name: 'Create auth user', pass: true, detail: email! });
    } else {
      checks.push({ name: 'Auth user exists', pass: true, detail: authUser.id });
    }

    const link = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: email!,
    });
    if (link.error) throw link.error;

    const hashedToken = link.data.properties.hashed_token;
    const anon = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const verified = await anon.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'email',
    });
    if (verified.error || !verified.data.session?.access_token) {
      throw verified.error ?? new Error('No access token from verifyOtp');
    }
    const token = verified.data.session.access_token;
    checks.push({ name: 'Obtain access token', pass: true, detail: 'ok' });

    const sync = await api('/auth/sync', token, { method: 'POST' });
    checks.push({
      name: 'POST /auth/sync',
      pass: sync.status === 200 || sync.status === 201,
      detail: `HTTP ${sync.status}`,
    });

    const profile = await prisma.profile.findUnique({ where: { email: email! } });
    if (!profile) throw new Error('Profile missing after sync');

    await ensureAdminRole(prisma, profile.id);
    checks.push({ name: 'Promote ADMINISTRATOR', pass: true, detail: profile.id });

    const me = await api('/auth/me', token);
    const meRole = (me.body as { data?: { role?: string } } | null)?.data?.role;
    checks.push({
      name: 'GET /auth/me role',
      pass: me.status === 200 && meRole === 'ADMINISTRATOR',
      detail: `HTTP ${me.status} role=${meRole}`,
    });

    const dashboard = await api('/admin/dashboard', token);
    checks.push({
      name: 'GET /admin/dashboard',
      pass:
        dashboard.status === 200 &&
        Boolean((dashboard.body as { data?: { counts?: unknown } })?.data?.counts),
      detail: `HTTP ${dashboard.status}`,
    });

    const products = await api('/admin/products?limit=3', token);
    const productItems =
      (products.body as { data?: { items?: Array<{ id: string; status: string }> } })?.data
        ?.items ?? [];
    checks.push({
      name: 'GET /admin/products',
      pass: products.status === 200 && productItems.length > 0,
      detail: `HTTP ${products.status} count=${productItems.length}`,
    });

    if (productItems[0]) {
      const patch = await api(`/admin/products/${productItems[0].id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: true }),
      });
      checks.push({
        name: 'PATCH /admin/products/:id',
        pass: patch.status === 200,
        detail: `HTTP ${patch.status}`,
      });
    }

    const quotes = await api('/admin/quotes?limit=5', token);
    checks.push({
      name: 'GET /admin/quotes',
      pass: quotes.status === 200,
      detail: `HTTP ${quotes.status} total=${
        (quotes.body as { data?: { total?: number } })?.data?.total ?? '?'
      }`,
    });

    const orders = await api('/admin/orders?limit=5', token);
    checks.push({
      name: 'GET /admin/orders',
      pass: orders.status === 200,
      detail: `HTTP ${orders.status} total=${
        (orders.body as { data?: { total?: number } })?.data?.total ?? '?'
      }`,
    });

    const customers = await api('/admin/customers?limit=5', token);
    checks.push({
      name: 'GET /admin/customers',
      pass: customers.status === 200,
      detail: `HTTP ${customers.status} total=${
        (customers.body as { data?: { total?: number } })?.data?.total ?? '?'
      }`,
    });

    const denied = await fetch(`${apiBase}/api/v1/admin/dashboard`);
    checks.push({
      name: 'GET /admin/dashboard unauthenticated',
      pass: denied.status === 401,
      detail: `HTTP ${denied.status}`,
    });
  } finally {
    await prisma.$disconnect();
  }

  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'}  ${check.name} — ${check.detail}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\nRESULT: ${checks.length - failed}/${checks.length} passed`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
