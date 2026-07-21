import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // Surface missing production secrets early in Vercel Runtime Logs
  const required = ['DATABASE_URL', 'DIRECT_URL'] as const;
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[boot] Missing required env: ${key}`);
    }
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // ─── API Versioning ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── CORS ────────────────────────────────────────────────────────────────
  // FRONTEND_URL may be a single origin or comma-separated list
  // (e.g. https://www.mcpfacbiotech.site,https://mcpfacbiotech.site).
  const corsOrigins = (
    process.env.FRONTEND_URL ?? 'http://localhost:3000,https://www.mcpfacbiotech.site,https://mcpfacbiotech.site'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Cart-Session'],
    exposedHeaders: ['X-Request-ID'],
  });

  // ─── Global Validation Pipe ──────────────────────────────────────────────
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

  // ─── Standard response envelope + error normalization (Appendix C) ───────
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── Swagger / OpenAPI ───────────────────────────────────────────────────
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

  // ─── Start Server ────────────────────────────────────────────────────────
  // Vercel injects PORT; keep listen() for Nest zero-config detection.
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`MCPFAC BIOTECH API running on port ${port}`);
  logger.log(`Swagger docs available at /api/docs`);
}

bootstrap().catch((error) => {
  console.error('[boot] NestJS bootstrap failed', error);
  throw error;
});
