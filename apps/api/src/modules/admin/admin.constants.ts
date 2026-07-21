import type { UserRole } from '@mcpfac/shared-types';
import { ADMIN_ACCESS_ROLES } from '@mcpfac/shared-types';

/** Any staff role with `admin:access`. */
export const ADMIN_ROLES = ADMIN_ACCESS_ROLES;

/** Catalog / inventory editors. */
export const ADMIN_CATALOG_ROLES: UserRole[] = [
  'SUPER_ADMINISTRATOR',
  'ADMINISTRATOR',
  'CONTENT_EDITOR',
  'INVENTORY_MANAGER',
];

/** Quote / order / customer operations. */
export const ADMIN_OPS_ROLES: UserRole[] = [
  'SUPER_ADMINISTRATOR',
  'ADMINISTRATOR',
  'SUPPORT',
];
