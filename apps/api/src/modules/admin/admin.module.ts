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

@Module({
  controllers: [
    AdminDashboardController,
    AdminProductsController,
    AdminQuotesController,
    AdminOrdersController,
    AdminCustomersController,
    AdminCategoriesController,
    AdminInventoryController,
  ],
  providers: [
    AdminDashboardService,
    AdminProductsService,
    AdminQuotesService,
    AdminOrdersService,
    AdminCustomersService,
    AdminCategoriesService,
    AdminInventoryService,
  ],
})
export class AdminModule {}
