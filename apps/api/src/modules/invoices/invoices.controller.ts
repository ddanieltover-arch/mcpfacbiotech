import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth('supabase-auth')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices for the authenticated customer' })
  async list(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    const result = await this.invoicesService.list(
      user.profileId!,
      query.page,
      query.limit,
    );

    return {
      message: 'Invoices retrieved',
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
  @ApiOperation({ summary: 'Get invoice detail' })
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.invoicesService.getById(user.profileId!, id);

    return {
      message: 'Invoice retrieved',
      data,
    };
  }
}
