import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { CommerceModule } from '@/modules/commerce/commerce.module';
import { CartModule } from '@/modules/cart/cart.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [CustomersModule, CommerceModule, CartModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
