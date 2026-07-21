import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from '@/modules/email/email.service';
import type { NewsletterSubscribeDto } from './newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly emailService: EmailService) {}

  async subscribe(dto: NewsletterSubscribeDto): Promise<void> {
    const email = dto.email.trim().toLowerCase();
    const sent = await this.emailService.sendNewsletterSubscription({ email });

    if (!sent) {
      throw new BadRequestException(
        'Unable to complete subscription right now. Please email info@mcpfacbiotech.cn directly.',
      );
    }
  }
}
