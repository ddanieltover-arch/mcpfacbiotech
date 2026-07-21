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
import { CompareService } from './compare.service';

class SyncCompareDto {
  @IsArray()
  @IsUUID('4', { each: true })
  productIds!: string[];
}

@ApiTags('compare')
@ApiBearerAuth('supabase-auth')
@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  @ApiOperation({ summary: 'List compare products for the authenticated customer' })
  async list(@CurrentUser() user: AuthUser) {
    const data = await this.compareService.list(user.profileId!);

    return {
      message: 'Compare list retrieved',
      data,
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync local compare product IDs to the server' })
  async sync(@CurrentUser() user: AuthUser, @Body() body: SyncCompareDto) {
    for (const productId of body.productIds.slice(0, 4)) {
      try {
        await this.compareService.add(user.profileId!, productId);
      } catch (error) {
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }

    const data = await this.compareService.list(user.profileId!);

    return {
      message: 'Compare list synced',
      data,
    };
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add a product to the compare list' })
  async add(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    const data = await this.compareService.add(user.profileId!, productId);

    return {
      message: 'Product added to compare list',
      data,
    };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from the compare list' })
  async remove(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    await this.compareService.remove(user.profileId!, productId);

    return {
      message: 'Product removed from compare list',
      data: null,
    };
  }
}
