import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { CompareController } from './compare.controller';
import { CompareService } from './compare.service';

@Module({
  imports: [CustomersModule],
  controllers: [CompareController],
  providers: [CompareService],
})
export class CompareModule {}
