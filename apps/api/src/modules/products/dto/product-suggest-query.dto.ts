import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSuggestQueryDto {
  @ApiPropertyOptional({ description: 'Search query for autocomplete', minLength: 2 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;

  @ApiPropertyOptional({ description: 'Maximum suggestions to return', default: 8 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 8;
}
