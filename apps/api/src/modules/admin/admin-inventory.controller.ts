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
import { AdminInventoryService } from './admin-inventory.service';
import { AdminInventoryQueryDto } from './dto/admin-query.dto';
import { UpdateAdminInventoryDto } from './dto/admin-mutations.dto';

@ApiTags('admin-inventory')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: AdminInventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory with optional low-stock filter' })
  async list(@Query() query: AdminInventoryQueryDto) {
    const data = await this.inventoryService.list(query);
    return { message: 'Admin inventory retrieved', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock quantity and low-stock threshold' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminInventoryDto,
  ) {
    const data = await this.inventoryService.update(id, body, user.profileId!);
    return { message: 'Admin inventory updated', data };
  }
}
