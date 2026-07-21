import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RequireProfile } from '@/common/decorators/require-profile.decorator';
import { SupabaseUserParam } from '@/common/decorators/supabase-user.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth('supabase-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @RequireProfile(false)
  @ApiOperation({ summary: 'Sync Supabase Auth user to Prisma profile and customer record' })
  @ApiResponse({ status: 200, description: 'Profile synced successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing authentication token' })
  async syncProfile(@SupabaseUserParam() supabaseUser: SupabaseUser) {
    const authUser = await this.authService.syncProfile(supabaseUser);

    return {
      message: 'Profile synced successfully',
      data: authUser,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user returned' })
  async getMe(@CurrentUser() user: AuthUser) {
    return {
      message: 'Authenticated user retrieved',
      data: user,
    };
  }
}
