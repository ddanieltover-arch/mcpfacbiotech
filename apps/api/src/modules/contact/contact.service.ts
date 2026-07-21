import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from '@/modules/email/email.service';
import type { ContactMessageDto } from './contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async submit(dto: ContactMessageDto): Promise<void> {
    const sent = await this.emailService.sendContactMessage({
      name: dto.name.trim(),
      email: dto.email.trim(),
      organization: dto.organization?.trim(),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
    });

    if (!sent) {
      throw new BadRequestException(
        'Unable to send your message right now. Please email info@mcpfacbiotech.site directly.',
      );
    }
  }
}
