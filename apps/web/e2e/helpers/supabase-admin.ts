import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} for auth E2E`);
  }
  return value;
}

export function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  }

  return createClient(url, requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function findUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

export async function createUnconfirmedUser(
  admin: SupabaseClient,
  params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
  },
): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: false,
    user_metadata: {
      first_name: params.firstName,
      last_name: params.lastName,
      country: params.country,
    },
  });

  if (error) throw error;
  if (!data.user?.id) {
    throw new Error('Admin createUser returned no user id');
  }

  return data.user.id;
}

export async function confirmUserEmail(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (error) throw error;
}

/** Returns a one-time magic link that exercises `/auth/callback`. */
export async function createMagicLink(
  admin: SupabaseClient,
  email: string,
  redirectTo: string,
): Promise<string> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  });

  if (error) throw error;
  const link = data.properties?.action_link;
  if (!link) {
    throw new Error('Supabase admin did not return action_link');
  }
  return link;
}

export async function deleteUserByEmail(admin: SupabaseClient, email: string): Promise<void> {
  const userId = await findUserIdByEmail(admin, email);
  if (!userId) return;

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
