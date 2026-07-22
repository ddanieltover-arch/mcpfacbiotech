import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CustomersModule } from './modules/customers/customers.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CompareModule } from './modules/compare/compare.module';
import { CartModule } from './modules/cart/cart.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { AccountModule } from './modules/account/account.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContactModule } from './modules/contact/contact.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { BlogModule } from './modules/blog/blog.module';
import { FaqModule } from './modules/faq/faq.module';
import { DatabaseModule } from './database/database.module';
import { AppLoggerModule } from './common/logging/logger.module';
import { EmailModule } from './modules/email/email.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // ─── Environment Configuration ───────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        join(process.cwd(), '../../.env.local'),
        join(process.cwd(), '../../.env'),
      ],
    }),

    // ─── Structured logging (Pino) ───────────────────────────────────────
    AppLoggerModule,

    // ─── Rate Limiting (100 req/min default per Appendix C) ──────────────
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),

    // ─── Database ────────────────────────────────────────────────────────
    DatabaseModule,
    EmailModule,

    // ─── Feature Modules (add as built) ──────────────────────────────────
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    WishlistModule,
    CompareModule,
    CartModule,
    QuotesModule,
    OrdersModule,
    InvoicesModule,
    AccountModule,
    AdminModule,
    ContactModule,
    NewsletterModule,
    DocumentsModule,
    BlogModule,
    FaqModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
