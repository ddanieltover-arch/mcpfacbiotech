import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { ContactService } from './contact.service';
import { ContactMessageDto } from './contact.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit a public contact form message' })
  async submit(@Body() dto: ContactMessageDto) {
    await this.contactService.submit(dto);

    return {
      message: 'Message sent successfully',
      data: { sent: true },
    };
  }
}
