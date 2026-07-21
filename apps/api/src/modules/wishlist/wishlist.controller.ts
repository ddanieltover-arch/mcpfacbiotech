import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

class SyncWishlistDto {
  @IsArray()
  @IsUUID('4', { each: true })
  productIds!: string[];
}

@ApiTags('wishlist')
@ApiBearerAuth('supabase-auth')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'List wishlist products for the authenticated customer' })
  async list(@CurrentUser() user: AuthUser) {
    const data = await this.wishlistService.list(user.profileId!);

    return {
      message: 'Wishlist retrieved',
      data,
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync local wishlist product IDs to the server' })
  async sync(@CurrentUser() user: AuthUser, @Body() body: SyncWishlistDto) {
    for (const productId of body.productIds) {
      try {
        await this.wishlistService.add(user.profileId!, productId);
      } catch (error) {
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }

    const data = await this.wishlistService.list(user.profileId!);

    return {
      message: 'Wishlist synced',
      data,
    };
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  async add(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    const data = await this.wishlistService.add(user.profileId!, productId);

    return {
      message: 'Product added to wishlist',
      data,
    };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  async remove(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    await this.wishlistService.remove(user.profileId!, productId);

    return {
      message: 'Product removed from wishlist',
      data: null,
    };
  }
}
