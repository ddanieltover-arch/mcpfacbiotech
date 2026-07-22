import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PrismaClient, UserRole } from '@prisma/client';
import type { APIRequestContext } from '@playwright/test';
import { backendBaseUrl, hasCommerceE2eEnv } from './commerce-env';
import { hasAuthE2eEnv } from '../../playwright.config';
import {
  confirmUserEmail,
  createSupabaseAdmin,
  createUnconfirmedUser,
  deleteUserByEmail,
} from './supabase-admin';

export function hasAdminE2eEnv(): boolean {
  return hasAuthE2eEnv() && hasCommerceE2eEnv();
}

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export async function createConfirmedUser(
  admin: SupabaseClient,
  params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string;
  },
): Promise<string> {
  const userId = await createUnconfirmedUser(admin, {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    country: params.country ?? 'United States',
  });
  await confirmUserEmail(admin, userId);
  return userId;
}

/** Sync Prisma profile via Nest, then assign ADMINISTRATOR role. */
export async function provisionAdminUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing Supabase URL or anon key');
  }

  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await anon.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session?.access_token) {
    throw new Error(`Admin sign-in for sync failed: ${error?.message ?? 'no session'}`);
  }

  const syncResponse = await fetch(`${backendBaseUrl()}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!syncResponse.ok) {
    const body = await syncResponse.text();
    throw new Error(`Profile sync failed (${syncResponse.status}): ${body}`);
  }

  await anon.auth.signOut();

  const db = getPrisma();
  const profile = await db.profile.findFirst({
    where: {
      OR: [
        { email: params.email },
        { email: params.email.toLowerCase() },
      ],
    },
  });
  if (!profile) {
    throw new Error(`Profile not found after sync for ${params.email}`);
  }

  const role = await db.role.findUnique({ where: { name: UserRole.ADMINISTRATOR } });
  if (!role) {
    throw new Error('ADMINISTRATOR role missing — run pnpm db:seed');
  }

  await db.userRoleAssignment.upsert({
    where: {
      profileId_roleId: {
        profileId: profile.id,
        roleId: role.id,
      },
    },
    create: {
      profileId: profile.id,
      roleId: role.id,
    },
    update: {},
  });

  const assigned = await db.userRoleAssignment.findMany({
    where: { profileId: profile.id },
    include: { role: true },
  });
  if (!assigned.some((row) => row.role.name === UserRole.ADMINISTRATOR)) {
    throw new Error(`Failed to assign ADMINISTRATOR to ${params.email}`);
  }
}

/**
 * Insert a PENDING guest order via Prisma (avoids 30–60s checkout API on slow DB).
 * `request` kept for call-site compatibility; unused.
 */
export async function createPendingGuestOrder(
  _request?: APIRequestContext,
): Promise<{ orderId: string; orderNumber: string }> {
  const db = getPrisma();
  const product = await db.product.findFirst({
    where: { deletedAt: null, retailPrice: { not: null } },
    select: { id: true, name: true, sku: true, retailPrice: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!product?.retailPrice) {
    throw new Error('No priced products in catalog — seed or import catalog first');
  }

  const guestEmail = `e2e.admin.order.${Date.now()}@example.com`;
  const guestRole = await db.role.findUnique({ where: { name: UserRole.GUEST } });
  const unitPrice = Number(product.retailPrice);
  const shippingCost = 15;
  const totalAmount = Number((unitPrice + shippingCost).toFixed(2));
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const orderNumber = `ORD-E2E-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;

  const profile = await db.profile.create({
    data: {
      authUserId: crypto.randomUUID(),
      email: guestEmail,
      firstName: 'E2E',
      lastName: 'AdminOrder',
      customer: {
        create: {
          customerGroup: 'RETAIL',
          country: 'United States',
        },
      },
      ...(guestRole
        ? {
            userRoles: {
              create: { roleId: guestRole.id },
            },
          }
        : {}),
    },
    include: { customer: true },
  });

  if (!profile.customer) {
    throw new Error('Guest customer missing after profile create');
  }

  const order = await db.order.create({
    data: {
      orderNumber,
      customerId: profile.customer.id,
      status: 'PENDING',
      paymentMethod: 'BANK_TRANSFER',
      shippingMethod: 'STANDARD',
      subtotal: unitPrice,
      shippingCost,
      taxAmount: 0,
      totalAmount,
      currency: 'USD',
      notes: 'E2E admin smoke order',
      items: {
        create: {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
        },
      },
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: 'PENDING',
          note: 'E2E seeded PENDING order',
          changedBy: profile.customer.id,
        },
      },
    },
  });

  return { orderId: order.id, orderNumber: order.orderNumber };
}

export { createSupabaseAdmin, deleteUserByEmail };
