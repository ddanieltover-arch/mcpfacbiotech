import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('orders')
@ApiBearerAuth('supabase-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for the authenticated customer' })
  async list(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    const result = await this.ordersService.list(
      user.profileId!,
      query.page,
      query.limit,
    );

    return {
      message: 'Orders retrieved',
      data: {
        items: result.items,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit) || 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ordersService.getById(user.profileId!, id);

    return {
      message: 'Order retrieved',
      data,
    };
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Place an order from cart or convert a quote' })
  async checkout(@CurrentUser() user: AuthUser, @Body() body: CheckoutDto) {
    const data = await this.ordersService.checkout(user.profileId!, body);

    return {
      message: 'Order created',
      data,
    };
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending order and issue an invoice' })
  async confirm(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ordersService.confirm(user.profileId!, id);

    return {
      message: 'Order confirmed',
      data,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order' })
  async cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ordersService.cancel(user.profileId!, id);

    return {
      message: 'Order cancelled',
      data,
    };
  }
}
