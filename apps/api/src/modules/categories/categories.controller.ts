import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get visible category tree' })
  async getTree() {
    const data = await this.categoriesService.getTree();

    return {
      message: 'Categories retrieved',
      data,
    };
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);

    return {
      message: 'Category retrieved',
      data,
    };
  }
}
