import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';
import { CustomerGroup, UserRole as PrismaUserRole } from '@prisma/client';
import type { AuthUser, UserRole } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';

const ORG_TYPE_TO_CUSTOMER_GROUP: Record<string, CustomerGroup> = {
  INDIVIDUAL: CustomerGroup.RETAIL,
  UNIVERSITY: CustomerGroup.UNIVERSITY,
  LABORATORY: CustomerGroup.RESEARCH,
  COMPANY: CustomerGroup.RESEARCH,
  DISTRIBUTOR: CustomerGroup.DISTRIBUTOR,
  INSTITUTION: CustomerGroup.INSTITUTION,
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (this.supabase) {
      return this.supabase;
    }

    const url =
      this.config.get<string>('SUPABASE_URL') ??
      this.config.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceRoleKey) {
      throw new Error('Supabase URL and service role key must be configured');
    }

    this.supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabase;
  }

  async validateToken(token: string): Promise<SupabaseUser> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    if (!data.user.email) {
      throw new UnauthorizedException('Authenticated user is missing an email address');
    }

    return data.user;
  }

  async resolveAuthUser(authUserId: string): Promise<AuthUser | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
      include: {
        userRoles: {
          include: { role: true },
        },
        customer: true,
      },
    });

    if (!profile) {
      return null;
    }

    return this.toAuthUser(profile);
  }

  async syncProfile(supabaseUser: SupabaseUser): Promise<AuthUser> {
    const metadata = supabaseUser.user_metadata ?? {};
    const firstName = (metadata.first_name as string | undefined)?.trim() || 'User';
    const lastName = (metadata.last_name as string | undefined)?.trim() || '';
    const organizationName = (metadata.organization_name as string | undefined)?.trim() || null;
    const organizationType = (metadata.organization_type as string | undefined)?.trim();
    const country = (metadata.country as string | undefined)?.trim() || null;
    const customerGroup =
      ORG_TYPE_TO_CUSTOMER_GROUP[organizationType ?? ''] ?? CustomerGroup.RETAIL;

    const profile = await this.prisma.profile.upsert({
      where: { authUserId: supabaseUser.id },
      create: {
        authUserId: supabaseUser.id,
        email: supabaseUser.email!,
        firstName,
        lastName,
      },
      update: {
        email: supabaseUser.email!,
        firstName,
        lastName,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        customer: true,
      },
    });

    await this.prisma.customer.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        customerGroup,
        organizationName,
        country,
      },
      update: {
        customerGroup,
        organizationName: organizationName ?? undefined,
        country: country ?? undefined,
      },
    });

    const customerRole = await this.prisma.role.findUnique({
      where: { name: PrismaUserRole.CUSTOMER },
    });

    if (customerRole) {
      await this.prisma.userRoleAssignment.upsert({
        where: {
          profileId_roleId: {
            profileId: profile.id,
            roleId: customerRole.id,
          },
        },
        create: {
          profileId: profile.id,
          roleId: customerRole.id,
        },
        update: {},
      });
    } else {
      this.logger.warn('CUSTOMER role not found — run `pnpm db:seed` to seed roles');
    }

    const syncedProfile = await this.prisma.profile.findUniqueOrThrow({
      where: { id: profile.id },
      include: {
        userRoles: {
          include: { role: true },
        },
        customer: true,
      },
    });

    return this.toAuthUser(syncedProfile);
  }

  private toAuthUser(profile: {
    id: string;
    email: string;
    userRoles: { role: { name: PrismaUserRole } }[];
  }): AuthUser {
    const primaryRole = this.resolvePrimaryRole(profile.userRoles.map((r) => r.role.name));

    return {
      id: profile.id,
      email: profile.email,
      role: primaryRole,
      profileId: profile.id,
    };
  }

  private resolvePrimaryRole(roles: PrismaUserRole[]): UserRole {
    const priority: UserRole[] = [
      'SUPER_ADMINISTRATOR',
      'ADMINISTRATOR',
      'INVENTORY_MANAGER',
      'CONTENT_EDITOR',
      'SUPPORT',
      'DISTRIBUTOR',
      'WHOLESALE_CUSTOMER',
      'RESEARCH_CUSTOMER',
      'CUSTOMER',
      'GUEST',
    ];

    for (const role of priority) {
      if (roles.includes(role as PrismaUserRole)) {
        return role;
      }
    }

    return 'CUSTOMER';
  }
}
