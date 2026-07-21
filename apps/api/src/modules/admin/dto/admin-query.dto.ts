import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CustomerGroup,
  OrderStatus,
  ProductAvailability,
  ProductStatus,
  QuoteStatus,
} from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class AdminProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;
}

export class AdminQuoteQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}

export class AdminOrderQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class AdminCustomerQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CustomerGroup })
  @IsOptional()
  @IsEnum(CustomerGroup)
  customerGroup?: CustomerGroup;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  suspended?: string;
}

export class AdminInventoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Only products at or below their low-stock threshold' })
  @IsOptional()
  @IsString()
  lowStockOnly?: string;

  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;
}

export class AdminCategoryQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visible?: string;
}
