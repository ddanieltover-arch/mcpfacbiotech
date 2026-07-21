import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_ROLES } from './admin.constants';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('admin')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_ROLES)
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin operations dashboard metrics' })
  async dashboard() {
    const data = await this.dashboardService.getDashboard();
    return {
      message: 'Admin dashboard retrieved',
      data,
    };
  }
}
