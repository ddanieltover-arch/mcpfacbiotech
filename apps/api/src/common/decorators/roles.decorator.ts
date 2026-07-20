import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@mcpfac/shared-types';

/**
 * Restrict access to users with one of the specified roles.
 * Used in combination with RolesGuard.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
