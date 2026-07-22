import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminQuotesController } from './admin-quotes.controller';
import { AdminQuotesService } from './admin-quotes.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminCustomersService } from './admin-customers.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminInventoryController } from './admin-inventory.controller';
import { AdminInventoryService } from './admin-inventory.service';
import { AdminDocumentsController } from './admin-documents.controller';
import { AdminDocumentsService } from './admin-documents.service';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaService } from './admin-media.service';
import { AdminBlogController } from './admin-blog.controller';
import { AdminBlogService } from './admin-blog.service';
import { AdminFaqController } from './admin-faq.controller';
import { AdminFaqService } from './admin-faq.service';

@Module({
  controllers: [
    AdminDashboardController,
    AdminProductsController,
    AdminQuotesController,
    AdminOrdersController,
    AdminCustomersController,
    AdminCategoriesController,
    AdminInventoryController,
    AdminDocumentsController,
    AdminMediaController,
    AdminBlogController,
    AdminFaqController,
  ],
  providers: [
    AdminDashboardService,
    AdminProductsService,
    AdminQuotesService,
    AdminOrdersService,
    AdminCustomersService,
    AdminCategoriesService,
    AdminInventoryService,
    AdminDocumentsService,
    AdminMediaService,
    AdminBlogService,
    AdminFaqService,
  ],
})
export class AdminModule {}
