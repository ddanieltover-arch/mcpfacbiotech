import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_CATALOG_ROLES } from './admin.constants';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryQueryDto } from './dto/admin-query.dto';
import {
  CreateAdminCategoryDto,
  UpsertAdminCategoryDto,
} from './dto/admin-mutations.dto';

@ApiTags('admin-categories')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories for admin CMS' })
  async list(@Query() query: AdminCategoryQueryDto) {
    const data = await this.categoriesService.list(query);
    return { message: 'Admin categories retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category detail' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.categoriesService.getById(id);
    return { message: 'Admin category retrieved', data };
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() body: CreateAdminCategoryDto) {
    const data = await this.categoriesService.create(body);
    return { message: 'Admin category created', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertAdminCategoryDto,
  ) {
    const data = await this.categoriesService.update(id, body);
    return { message: 'Admin category updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete category (no children allowed)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.softDelete(id);
    return { message: 'Admin category deleted', data: null };
  }
}
