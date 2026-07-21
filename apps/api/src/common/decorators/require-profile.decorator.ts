import { SetMetadata } from '@nestjs/common';

/**
 * When false, the auth guard validates the JWT but does not require a synced
 * Prisma profile. Used for the profile sync endpoint itself.
 */
export const REQUIRE_PROFILE_KEY = 'requireProfile';
export const RequireProfile = (required = true) => SetMetadata(REQUIRE_PROFILE_KEY, required);
