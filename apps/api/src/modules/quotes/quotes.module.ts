import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { CommerceModule } from '@/modules/commerce/commerce.module';
import { CartModule } from '@/modules/cart/cart.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [CustomersModule, CommerceModule, CartModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
