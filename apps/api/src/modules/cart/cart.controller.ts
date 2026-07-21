import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('cart')
@ApiBearerAuth('supabase-auth')
@ApiHeader({
  name: 'X-Cart-Session',
  required: false,
  description: 'Guest cart session UUID (required when not authenticated)',
})
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the active cart (guest or authenticated)' })
  async getCart(
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    const data = await this.cartService.getCart(user?.profileId, sessionId);

    return {
      message: 'Cart retrieved',
      data,
    };
  }

  @Post('items')
  @Public()
  @ApiOperation({ summary: 'Add a product to the cart' })
  async addItem(
    @Body() body: AddCartItemDto,
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    this.cartService.requireIdentity(user?.profileId, sessionId);
    const data = await this.cartService.addItem(
      body.productId,
      body.quantity,
      user?.profileId,
      sessionId,
    );

    return {
      message: 'Item added to cart',
      data,
    };
  }

  @Patch('items/:productId')
  @Public()
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateCartItemDto,
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    this.cartService.requireIdentity(user?.profileId, sessionId);
    const data = await this.cartService.updateItem(
      productId,
      body.quantity,
      user?.profileId,
      sessionId,
    );

    return {
      message: 'Cart item updated',
      data,
    };
  }

  @Delete('items/:productId')
  @Public()
  @ApiOperation({ summary: 'Remove a product from the cart' })
  async removeItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    this.cartService.requireIdentity(user?.profileId, sessionId);
    const data = await this.cartService.removeItem(
      productId,
      user?.profileId,
      sessionId,
    );

    return {
      message: 'Cart item removed',
      data,
    };
  }

  @Patch()
  @Public()
  @ApiOperation({ summary: 'Update cart notes' })
  async updateCart(
    @Body() body: UpdateCartDto,
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    this.cartService.requireIdentity(user?.profileId, sessionId);
    const data = await this.cartService.updateNotes(
      body.notes,
      user?.profileId,
      sessionId,
    );

    return {
      message: 'Cart updated',
      data,
    };
  }

  @Delete()
  @Public()
  @ApiOperation({ summary: 'Clear all items from the cart' })
  async clearCart(
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    this.cartService.requireIdentity(user?.profileId, sessionId);
    const data = await this.cartService.clearCart(user?.profileId, sessionId);

    return {
      message: 'Cart cleared',
      data,
    };
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into the authenticated customer cart' })
  async merge(
    @CurrentUser() user: AuthUser,
    @Headers('x-cart-session') sessionId?: string,
  ) {
    const data = await this.cartService.mergeGuestCart(user.profileId!, sessionId);

    return {
      message: 'Cart merged',
      data,
    };
  }
}
