import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { CommerceModule } from '@/modules/commerce/commerce.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [CustomersModule, CommerceModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
