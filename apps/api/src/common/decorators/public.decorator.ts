import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as publicly accessible, bypassing the default AuthGuard.
 * Per Appendix C: every route is authenticated by default; public routes
 * are the explicit exception.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
