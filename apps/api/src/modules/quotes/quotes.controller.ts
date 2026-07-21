import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';

@ApiTags('quotes')
@ApiBearerAuth('supabase-auth')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List quotes for the authenticated customer' })
  async list(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    const result = await this.quotesService.list(
      user.profileId!,
      query.page,
      query.limit,
    );

    return {
      message: 'Quotes retrieved',
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
  @ApiOperation({ summary: 'Get quote detail' })
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.quotesService.getById(user.profileId!, id);

    return {
      message: 'Quote retrieved',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a draft quote from cart or explicit items' })
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateQuoteDto) {
    const data = await this.quotesService.create(user.profileId!, body);

    return {
      message: 'Quote created',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft quote' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateQuoteDto,
  ) {
    const data = await this.quotesService.update(user.profileId!, id, body);

    return {
      message: 'Quote updated',
      data,
    };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a draft quote for review' })
  async submit(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.quotesService.submit(user.profileId!, id);

    return {
      message: 'Quote submitted',
      data,
    };
  }
}
