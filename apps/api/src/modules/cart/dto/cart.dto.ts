import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Selected product variant' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity. Set to 0 to remove the item.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Selected product variant' })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class UpdateCartDto {
  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
