import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSuggestQueryDto } from './dto/product-suggest-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List published products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated product list returned' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query);

    return {
      message: 'Products retrieved',
      data,
    };
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'List featured products for homepage and highlights' })
  async findFeatured() {
    const data = await this.productsService.findFeatured();

    return {
      message: 'Featured products retrieved',
      data,
    };
  }

  @Get('search/suggest')
  @Public()
  @ApiOperation({ summary: 'Autocomplete product search suggestions' })
  async suggest(@Query() query: ProductSuggestQueryDto) {
    const data = await this.productsService.suggest(query.q, query.limit ?? 8);

    return {
      message: 'Search suggestions retrieved',
      data,
    };
  }

  @Get('batch')
  @Public()
  @ApiOperation({ summary: 'Fetch multiple products by ID' })
  async findBatch(@Query('ids') ids?: string | string[]) {
    const idList = Array.isArray(ids)
      ? ids
      : (ids ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

    const data = await this.productsService.findManyByIds(idList);

    return {
      message: 'Products retrieved',
      data,
    };
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get product detail by slug' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);

    return {
      message: 'Product retrieved',
      data,
    };
  }
}
