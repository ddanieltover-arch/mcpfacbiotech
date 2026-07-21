import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscribeDto } from './newsletter.dto';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Subscribe an email to the research newsletter' })
  async subscribe(@Body() dto: NewsletterSubscribeDto) {
    await this.newsletterService.subscribe(dto);

    return {
      message: 'Subscribed successfully',
      data: { subscribed: true },
    };
  }
}
