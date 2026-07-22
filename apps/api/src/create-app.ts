import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

const isServerless = Boolean(process.env.VERCEL);

function corsOrigins(): string | string[] {
  const origins = (
    process.env.FRONTEND_URL ??
    'http://localhost:3000,https://www.mcpfacbiotech.site,https://mcpfacbiotech.site'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0]! : origins;
}

function logMissingEnv(): void {
  for (const key of ['DATABASE_URL', 'DIRECT_URL'] as const) {
    if (!process.env[key]) {
      console.error(`[boot] Missing required env: ${key}`);
    }
  }
}

export async function configureApp(app: INestApplication): Promise<void> {
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Cart-Session'],
    exposedHeaders: ['X-Request-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger uses legacy /* routes that warn on Nest 11; skip on Vercel cold starts.
  if (!isServerless) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MCPFAC BIOTECH API')
      .setDescription(
        'Enterprise B2B E-Commerce API for biotechnology research products. ' +
          'Provides endpoints for products, orders, quotes, invoices, documents, ' +
          'customer management, and administrative operations.',
      )
      .setVersion('1.0.0')
      .setContact('MCPFAC BIOTECH', 'https://mcpfacbiotech.site', 'info@mcpfacbiotech.site')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase Auth JWT token',
        },
        'supabase-auth',
      )
      .addTag('auth', 'Authentication & authorization')
      .addTag('products', 'Product catalog management')
      .addTag('categories', 'Product category management')
      .addTag('cart', 'Shopping cart operations')
      .addTag('quotes', 'Quotation engine')
      .addTag('orders', 'Order management')
      .addTag('invoices', 'Invoice management')
      .addTag('documents', 'Document management (COA, MSDS, HPLC)')
      .addTag('customers', 'Customer management')
      .addTag('downloads', 'Download center')
      .addTag('blog', 'Blog & research articles')
      .addTag('support', 'Support ticket system')
      .addTag('account', 'Customer portal & account settings')
      .addTag('admin', 'Administration console')
      .addTag('health', 'System health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  }
}

/**
 * Express instance for Vercel serverless (no listen).
 * Use Nest's own Express app — wrapping an external express() via ExpressAdapter
 * triggers Express 4's deprecated `app.router` getter and crashes cold start.
 */
export async function getExpressInstance(): Promise<Express> {
  logMissingEnv();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  await configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

/** Full Nest app for local `nest start` / `node dist/main`. */
export async function createNestApp(): Promise<INestApplication> {
  logMissingEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  await configureApp(app);
  return app;
}
