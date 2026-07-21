import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  organizationName?: string;

  @IsString()
  @MaxLength(300)
  addressLine1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  addressLine2?: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateProvince?: string;

  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @IsString()
  @MaxLength(100)
  country!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export enum CheckoutPaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  CRYPTO = 'CRYPTO',
  OTHER = 'OTHER',
}

export class CheckoutDto {
  @ApiPropertyOptional({ description: 'Create order from the authenticated customer cart' })
  @IsOptional()
  @IsBoolean()
  fromCart?: boolean;

  @ApiPropertyOptional({ description: 'Convert a SUBMITTED or APPROVED quote to an order' })
  @IsOptional()
  @IsUUID()
  quoteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  purchaseOrderNumber?: string;

  @ApiPropertyOptional({ enum: CheckoutPaymentMethod, default: CheckoutPaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(CheckoutPaymentMethod)
  paymentMethod?: CheckoutPaymentMethod = CheckoutPaymentMethod.BANK_TRANSFER;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  @ApiPropertyOptional({ type: CheckoutAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  shippingAddress?: CheckoutAddressDto;

  @ApiPropertyOptional({ type: CheckoutAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  billingAddress?: CheckoutAddressDto;
}
