import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // ─── API Versioning ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
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
    .setContact('MCPFAC BIOTECH', 'https://mcpfacbiotech.cn', 'info@mcpfacbiotech.cn')
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
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`MCPFAC BIOTECH API running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
