import { Module } from '@nestjs/common';
import { CustomersModule } from '@/modules/customers/customers.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [CustomersModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
