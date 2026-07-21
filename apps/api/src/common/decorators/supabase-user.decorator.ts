import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

/**
 * Extract the validated Supabase Auth user attached by SupabaseAuthGuard.
 */
export const SupabaseUserParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseAuthUser => {
    const request = ctx.switchToHttp().getRequest<{ supabaseUser: SupabaseAuthUser }>();
    return request.supabaseUser;
  },
);
