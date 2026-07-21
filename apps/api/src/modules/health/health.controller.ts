import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/database/prisma.service';
import { EmailService } from '@/modules/email/email.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'API health check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  async check() {
    let databaseStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'unhealthy';
    }

    return {
      data: {
        status: 'ok',
        api: 'healthy',
        database: databaseStatus,
        email: this.emailService.isEnabled() ? 'configured' : 'disabled',
        version: '0.1.0',
        environment: process.env.NODE_ENV ?? 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}
