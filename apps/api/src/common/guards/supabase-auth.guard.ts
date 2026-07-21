import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { REQUIRE_PROFILE_KEY } from '@/common/decorators/require-profile.decorator';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    // Public routes allow anonymous access, but still soft-attach the user when a
    // Bearer token is present (guest + auth cart resolution).
    if (isPublic) {
      if (token) {
        try {
          const supabaseUser = await this.authService.validateToken(token);
          (request as Request & { supabaseUser: unknown }).supabaseUser = supabaseUser;

          const authUser = await this.authService.resolveAuthUser(supabaseUser.id);
          if (authUser) {
            (request as Request & { user: unknown }).user = authUser;
          }
        } catch {
          // Ignore invalid tokens on public endpoints.
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const requireProfile =
      this.reflector.getAllAndOverride<boolean>(REQUIRE_PROFILE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    await this.attachAuth(request, token, requireProfile);
    return true;
  }

  private async attachAuth(
    request: Request,
    token: string,
    requireProfile: boolean,
  ): Promise<void> {
    const supabaseUser = await this.authService.validateToken(token);
    (request as Request & { supabaseUser: unknown }).supabaseUser = supabaseUser;

    if (!requireProfile) {
      return;
    }

    const authUser = await this.authService.resolveAuthUser(supabaseUser.id);

    if (!authUser) {
      throw new UnauthorizedException(
        'Profile not synced. Call POST /api/v1/auth/sync after authentication.',
      );
    }

    (request as Request & { user: unknown }).user = authUser;
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    return authorization.slice('Bearer '.length).trim() || null;
  }
}
