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
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_OPS_ROLES } from './admin.constants';
import { AdminQuotesService } from './admin-quotes.service';
import { AdminQuoteQueryDto } from './dto/admin-query.dto';
import { AdminQuoteActionDto } from './dto/admin-mutations.dto';

@ApiTags('admin-quotes')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_OPS_ROLES)
@Controller('admin/quotes')
export class AdminQuotesController {
  constructor(private readonly quotesService: AdminQuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all customer quotes' })
  async list(@Query() query: AdminQuoteQueryDto) {
    const data = await this.quotesService.list(query);
    return {
      message: 'Admin quotes retrieved',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote detail for review' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.quotesService.getById(id);
    return {
      message: 'Admin quote retrieved',
      data,
    };
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Mark quote as under review' })
  async review(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminQuoteActionDto,
  ) {
    const data = await this.quotesService.startReview(id, user.profileId!, body);
    return {
      message: 'Quote marked under review',
      data,
    };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a submitted quote' })
  async approve(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminQuoteActionDto,
  ) {
    const data = await this.quotesService.approve(id, user.profileId!, body);
    return {
      message: 'Quote approved',
      data,
    };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a submitted quote' })
  async reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminQuoteActionDto,
  ) {
    const data = await this.quotesService.reject(id, user.profileId!, body);
    return {
      message: 'Quote rejected',
      data,
    };
  }
}
