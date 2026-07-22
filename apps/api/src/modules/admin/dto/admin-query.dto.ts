import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  BlogPostStatus,
  CustomerGroup,
  DocumentType,
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

export class AdminDocumentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Filter by approval: true | false' })
  @IsOptional()
  @IsString()
  approved?: string;
}

export class AdminMediaQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folder?: string;
}

export class AdminBlogQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BlogPostStatus })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;
}

export class AdminFaqQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by visibility: true | false' })
  @IsOptional()
  @IsString()
  visible?: string;
}
