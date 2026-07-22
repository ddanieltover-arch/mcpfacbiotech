import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { Public } from '@/common/decorators/public.decorator';
import { DocumentsService } from './documents.service';

class DocumentSearchQueryDto {
  @ApiPropertyOptional({ description: 'SKU, product name, or document title' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search approved public documents (COA library)' })
  async search(@Query() query: DocumentSearchQueryDto) {
    const data = await this.documentsService.search(query);
    return { message: 'Documents retrieved', data };
  }
}
