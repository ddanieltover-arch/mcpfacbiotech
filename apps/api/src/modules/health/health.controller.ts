import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@/database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
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
        version: '0.1.0',
        environment: process.env.NODE_ENV ?? 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}
