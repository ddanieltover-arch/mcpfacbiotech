import { UnauthorizedException } from '@nestjs/common';
import { CustomerGroup, UserRole as PrismaUserRole } from '@prisma/client';
import { AuthService } from './auth.service';

const getUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser },
  })),
}));

describe('AuthService', () => {
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    customer: {
      upsert: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    userRoleAssignment: {
      upsert: jest.fn(),
    },
  };

  const config = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      };
      return map[key];
    }),
  };

  const service = new AuthService(prisma as never, config as never);

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      };
      return map[key];
    });
  });

  describe('validateToken', () => {
    it('returns the supabase user when token is valid', async () => {
      const user = { id: 'auth-1', email: 'a@b.com' };
      getUser.mockResolvedValue({ data: { user }, error: null });

      await expect(service.validateToken('tok')).resolves.toEqual(user);
    });

    it('throws when token is invalid', async () => {
      getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } });

      await expect(service.validateToken('bad')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when user has no email', async () => {
      getUser.mockResolvedValue({ data: { user: { id: 'auth-1' } }, error: null });

      await expect(service.validateToken('tok')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('resolveAuthUser', () => {
    it('returns null when profile missing', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      await expect(service.resolveAuthUser('auth-1')).resolves.toBeNull();
    });

    it('maps ADMINISTRATOR as primary role when present with CUSTOMER', async () => {
      prisma.profile.findUnique.mockResolvedValue({
        id: 'p1',
        email: 'a@b.com',
        userRoles: [
          { role: { name: PrismaUserRole.CUSTOMER } },
          { role: { name: PrismaUserRole.ADMINISTRATOR } },
        ],
        customer: { id: 'c1' },
      });

      const result = await service.resolveAuthUser('auth-1');
      expect(result).toEqual({
        id: 'p1',
        email: 'a@b.com',
        role: 'ADMINISTRATOR',
        profileId: 'p1',
      });
    });
  });

  describe('syncProfile', () => {
    it('upserts profile, customer, and CUSTOMER role', async () => {
      const supabaseUser = {
        id: 'auth-1',
        email: 'a@b.com',
        user_metadata: {
          first_name: 'Ada',
          last_name: 'Lovelace',
          organization_name: 'Lab Co',
          organization_type: 'LABORATORY',
          country: 'DE',
        },
      };

      prisma.profile.upsert.mockResolvedValue({
        id: 'p1',
        email: 'a@b.com',
        userRoles: [],
        customer: null,
      });
      prisma.role.findUnique.mockResolvedValue({ id: 'role-customer' });
      prisma.profile.findUniqueOrThrow.mockResolvedValue({
        id: 'p1',
        email: 'a@b.com',
        userRoles: [{ role: { name: PrismaUserRole.CUSTOMER } }],
        customer: { id: 'c1' },
      });

      const result = await service.syncProfile(supabaseUser as never);

      expect(prisma.customer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            customerGroup: CustomerGroup.RESEARCH,
            organizationName: 'Lab Co',
            country: 'DE',
          }),
        }),
      );
      expect(prisma.userRoleAssignment.upsert).toHaveBeenCalled();
      expect(result.role).toBe('CUSTOMER');
    });

    it('warns when CUSTOMER role is missing from seed', async () => {
      const warn = jest.spyOn((service as unknown as { logger: { warn: (m: string) => void } }).logger, 'warn');
      prisma.profile.upsert.mockResolvedValue({
        id: 'p1',
        email: 'a@b.com',
        userRoles: [],
        customer: null,
      });
      prisma.role.findUnique.mockResolvedValue(null);
      prisma.profile.findUniqueOrThrow.mockResolvedValue({
        id: 'p1',
        email: 'a@b.com',
        userRoles: [],
        customer: { id: 'c1' },
      });

      const result = await service.syncProfile({
        id: 'auth-1',
        email: 'a@b.com',
        user_metadata: {},
      } as never);

      expect(warn).toHaveBeenCalled();
      expect(result.role).toBe('CUSTOMER');
      warn.mockRestore();
    });
  });

  it('throws when supabase env is missing', () => {
    config.get.mockReturnValue(undefined);
    const broken = new AuthService(prisma as never, config as never);
    expect(() =>
      (broken as unknown as { getSupabaseClient: () => unknown }).getSupabaseClient(),
    ).toThrow(/Supabase URL/);
  });
});
