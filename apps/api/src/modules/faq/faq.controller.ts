import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { FaqService } from './faq.service';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List visible FAQ grouped by category' })
  async listCategories() {
    const data = await this.faqService.listByCategory();
    return { message: 'FAQ categories retrieved', data };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List visible FAQ questions (flat)' })
  async list() {
    const data = await this.faqService.listPublic();
    return { message: 'FAQ retrieved', data };
  }
}
