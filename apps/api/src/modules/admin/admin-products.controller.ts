import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_CATALOG_ROLES } from './admin.constants';
import { AdminProductsService } from './admin-products.service';
import { AdminProductQueryDto } from './dto/admin-query.dto';
import { UpdateAdminProductDto } from './dto/admin-mutations.dto';

@ApiTags('admin-products')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products for admin catalog management' })
  async list(@Query() query: AdminProductQueryDto) {
    const data = await this.productsService.list(query);
    return {
      message: 'Admin products retrieved',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail for admin editing' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.productsService.getById(id);
    return {
      message: 'Admin product retrieved',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product catalog fields (status, stock, pricing)' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminProductDto,
  ) {
    const data = await this.productsService.update(id, body, user.profileId!);
    return {
      message: 'Admin product updated',
      data,
    };
  }
}
