import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [CustomersModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
