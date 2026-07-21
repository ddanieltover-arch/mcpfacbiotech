import { Module } from '@nestjs/common';
import { CommercePricingService } from './commerce-pricing';

@Module({
  providers: [CommercePricingService],
  exports: [CommercePricingService],
})
export class CommerceModule {}
