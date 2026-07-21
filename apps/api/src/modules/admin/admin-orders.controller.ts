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
import { ADMIN_OPS_ROLES } from './admin.constants';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dto/admin-query.dto';
import { UpdateAdminOrderStatusDto } from './dto/admin-mutations.dto';

@ApiTags('admin-orders')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_OPS_ROLES)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customer orders' })
  async list(@Query() query: AdminOrderQueryDto) {
    const data = await this.ordersService.list(query);
    return {
      message: 'Admin orders retrieved',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail for fulfillment' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.ordersService.getById(id);
    return {
      message: 'Admin order retrieved',
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance or cancel order status (issues invoice on confirm)' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(id, user.profileId!, body);
    return {
      message: 'Order status updated',
      data,
    };
  }
}
