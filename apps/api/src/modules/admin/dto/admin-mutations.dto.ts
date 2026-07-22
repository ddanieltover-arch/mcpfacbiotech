import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DocumentPermission,
  DocumentType,
  OrderStatus,
  ProductAvailability,
  ProductStatus,
  BlogPostStatus,
} from '@prisma/client';

export class UpdateAdminProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Alert when stockQuantity <= this value' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minimumOrderQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  retailPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  wholesalePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distributorPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;
}

export class AdminQuoteActionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}

export class UpdateAdminOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}

export class UpdateAdminCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSuspended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpsertAdminCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;
}

export class CreateAdminCategoryDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateAdminInventoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  leadTimeDays?: number;
}

export class CreateAdminDocumentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  fileUrl!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  fileName!: string;

  @ApiPropertyOptional({ enum: DocumentPermission })
  @IsOptional()
  @IsEnum(DocumentPermission)
  permission?: DocumentPermission;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({ description: 'Attach to product on create' })
  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class UpdateAdminDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  fileName?: string;

  @ApiPropertyOptional({ enum: DocumentPermission })
  @IsOptional()
  @IsEnum(DocumentPermission)
  permission?: DocumentPermission;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isApproved?: boolean;
}

export class AttachAdminDocumentProductDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;
}

export class CreateAdminMediaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  fileName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  fileUrl!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  folder?: string;
}

export class UpdateAdminMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  fileName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  folder?: string;
}

export class CreateAdminBlogPostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'JSON sections payload or plain text' })
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorName?: string;

  @ApiPropertyOptional({ enum: BlogPostStatus })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  categoryName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readingTime?: string;
}

export class UpdateAdminBlogPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorName?: string;

  @ApiPropertyOptional({ enum: BlogPostStatus })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  categoryName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readingTime?: string;
}

export class CreateAdminFaqCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateAdminFaqCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;
}

export class CreateAdminFaqQuestionDto {
  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  question!: string;

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateAdminFaqQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVisible?: boolean;
}
