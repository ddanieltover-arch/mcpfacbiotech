import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@mcpfac/shared-types';

/**
 * Extract the authenticated user from the request object.
 * The user is attached by the AuthGuard after JWT validation.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: AuthUser) { ... }
 *
 *   @Get('profile')
 *   getEmail(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
