import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.error(
        'DATABASE_URL is not set — configure it on the Vercel API project (Production).',
      );
      return;
    }

    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Database connection established');
    } catch (error) {
      // Do not crash the serverless function on cold start; health reports unhealthy.
      this.logger.error(
        'Database connection failed. Check DATABASE_URL / DIRECT_URL and Prisma engines.',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async onModuleDestroy() {
    if (!this.connected) {
      return;
    }
    await this.$disconnect();
    this.connected = false;
    this.logger.log('Database connection closed');
  }
}
