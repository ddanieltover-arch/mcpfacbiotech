import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
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

  @Public()
  @Post('checkout')
  @ApiHeader({
    name: 'X-Cart-Session',
    required: false,
    description: 'Guest cart session UUID (required for guest checkout)',
  })
  @ApiOperation({
    summary: 'Place an order from cart or convert a quote (guest checkout supported)',
  })
  async checkout(
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId: string | undefined,
    @Body() body: CheckoutDto,
  ) {
    if (!user?.profileId && body.quoteId) {
      throw new UnauthorizedException('Sign in to convert a quote to an order');
    }

    if (!user?.profileId && !body.guestEmail) {
      throw new BadRequestException('Email is required for guest checkout');
    }

    if (!user?.profileId && !body.fromCart) {
      throw new BadRequestException('Guest checkout requires fromCart=true');
    }

    const data = await this.ordersService.checkout({
      profileId: user?.profileId,
      sessionId,
      dto: body,
    });

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
